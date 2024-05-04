import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import weightPoints from "@/app/utils/weightsPoints";

export interface IKeypoint3D {
  x: number;
  y: number;
  z?: number;
  score?: number;
  name?: string;
}

export const connections = poseDetection.util.getAdjacentPairs(
  poseDetection.SupportedModels.BlazePose
);

function getKeypointByName<T extends { name?: string }>(
  keypoints: T[],
  name: string
): T | undefined {
  return keypoints.find((keypoint) => keypoint.name === name);
}

function findMidpoint(point1: IKeypoint3D, point2: IKeypoint3D): IKeypoint3D {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    z: ((point1.z || 0) + (point2.z || 0)) / 2,
  };
}

const getHipsMiddlePoint = (points: IKeypoint3D[]): IKeypoint3D => {
  const rightHip = getKeypointByName<IKeypoint3D>(points, "right_hip");
  const leftHip = getKeypointByName<IKeypoint3D>(points, "right_hip");
  if (rightHip && leftHip) return findMidpoint(leftHip, rightHip);
  return {
    x: 0,
    y: 0,
    z: 0,
  };
};

const getShoulderMiddlePoint = (points: IKeypoint3D[]) => {
  const rightShoulder = getKeypointByName<IKeypoint3D>(
    points,
    "right_shoulder"
  );
  const leftShoulder = getKeypointByName<IKeypoint3D>(points, "left_shoulder");
  if (rightShoulder && leftShoulder)
    return findMidpoint(leftShoulder, rightShoulder);
  return {
    x: 0,
    y: 0,
    z: 0,
  };
};

const getCenterPoint = (points: IKeypoint3D[]): IKeypoint3D => {
  const hipsMiddlePoint = getHipsMiddlePoint(points);
  const shoulderMiddlePoint = getShoulderMiddlePoint(points);
  return findMidpoint(hipsMiddlePoint, shoulderMiddlePoint);
};

function centralizePoints(
  keypoints: IKeypoint3D[],
  centerPoint: IKeypoint3D
): IKeypoint3D[] {
  return keypoints.map((keypoint) => ({
    ...keypoint,
    x: keypoint.x - centerPoint.x,
    y: keypoint.y - centerPoint.y,
    z: keypoint.z !== undefined ? keypoint.z - (centerPoint.z ?? 0) : undefined,
  }));
}

export function cosineSimilarity(
  unCentralizedPoseOne: IKeypoint3D[],
  unCentralizedPoseTwo: IKeypoint3D[]
): number {
  const newPoseOneCenter = getCenterPoint(unCentralizedPoseOne);
  const newPoseTwoCenter = getCenterPoint(unCentralizedPoseTwo);

  const poseOne = centralizePoints(unCentralizedPoseOne, newPoseOneCenter);
  const poseTwo = centralizePoints(unCentralizedPoseTwo, newPoseTwoCenter);

  const featuresOne = extractFeaturesFromKeypoints(poseOne);
  const featuresTwo = extractFeaturesFromKeypoints(poseTwo);

  const tensorOne = tf.tensor(featuresOne);
  const tensorTwo = tf.tensor(featuresTwo);

  const result = tf.tidy(() => {
    const dotProduct = tf.dot(tensorOne, tensorTwo).dataSync()[0];
    const normOne = tf.norm(tensorOne).dataSync()[0];
    const normTwo = tf.norm(tensorTwo).dataSync()[0];
    return dotProduct / (normOne * normTwo);
  });

  tensorOne.dispose();
  tensorTwo.dispose();

  return result;
}

export function extractFeaturesFromKeypoints(
  keypoints: IKeypoint3D[]
): number[] {
  const features: number[] = keypoints.flatMap((keypoint, _index) => {
    const scoreWeighted = keypoint.score || 1;
    const defaultWeighPoint = keypoint.name
      ? getKeypointByName(weightPoints, keypoint.name)
      : undefined;
    const defaultWeight = defaultWeighPoint?.weight
      ? defaultWeighPoint.weight
      : 1;
    return [
      keypoint.x * scoreWeighted * defaultWeight,
      keypoint.y * scoreWeighted * defaultWeight,
      (keypoint.z || 0) * scoreWeighted * defaultWeight,
    ].map((feature) => feature);
  });

  const angleTriples = generateUniqueTriples(connections);
  angleTriples.forEach((triple) => {
    const [firstIndex, secondIndex, thirdIndex] = triple.map(Number);
    const keypointOne = keypoints[firstIndex];
    const keypointTwo = keypoints[secondIndex];
    const keypointThree = keypoints[thirdIndex];

    if (keypointOne && keypointTwo && keypointThree) {
      const { phi, theta } = calculateSphericalAngles(
        keypointOne,
        keypointTwo,
        keypointThree
      );

      const scoreWeighted = [
        keypointOne.score,
        keypointTwo.score,
        keypointThree.score,
      ].map((s) => s || 1);

      const averageScore =
        (scoreWeighted[0] + scoreWeighted[1] + scoreWeighted[2]) / 3;
      if (averageScore >= 0.5) {
        features.push(phi * averageScore, theta * averageScore);
      } else {
        features.push(0, 0);
      }
    }
  });

  return features;
}

export function calculateSphericalAngles(
  keypointOne: IKeypoint3D,
  keypointTwo: IKeypoint3D,
  keypointThree: IKeypoint3D
): { theta: number; phi: number } {
  const scoreSum =
    (keypointOne?.score || 0) +
    (keypointTwo?.score || 0) +
    (keypointThree?.score || 0);
  const averageScore = scoreSum / 3;
  const vectorOne = tf.tensor([
    (keypointTwo.x - keypointOne.x) * averageScore,
    (keypointTwo.y - keypointOne.y) * averageScore,
    ((keypointTwo.z || 0) - (keypointOne.z || 0)) * averageScore,
  ]);
  const vectorTwo = tf.tensor([
    (keypointThree.x - keypointTwo.x) * averageScore,
    (keypointThree.y - keypointTwo.y) * averageScore,
    ((keypointThree.z || 0) - (keypointTwo.z || 0)) * averageScore,
  ]);

  const vectorOneSpherical = cartesianToSpherical(vectorOne);
  const vectorTwoSpherical = cartesianToSpherical(vectorTwo);

  const thetaDifference = Math.abs(
    vectorOneSpherical.theta - vectorTwoSpherical.theta
  );
  const phiDifference = Math.abs(
    vectorOneSpherical.phi - vectorTwoSpherical.phi
  );

  vectorOne.dispose();
  vectorTwo.dispose();

  return { theta: thetaDifference, phi: phiDifference };
}

export function cartesianToSpherical(vector: tf.Tensor): {
  r: number;
  theta: number;
  phi: number;
} {
  const x = vector.dataSync()[0];
  const y = vector.dataSync()[1];
  const z = vector.dataSync()[2];

  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / r);
  const phi = Math.atan2(y, x);

  return { r, theta, phi };
}

export function generateUniqueTriples(pairs: number[][]): number[][] {
  const uniqueTriples = new Set<string>();

  const map = new Map<number, Set<number>>();
  pairs.forEach(([a, b]) => {
    if (!map.has(a)) map.set(a, new Set());
    if (!map.has(b)) map.set(b, new Set());
    map.get(a)?.add(b);
    map.get(b)?.add(a);
  });

  pairs.forEach(([first, second]) => {
    const connectedToFirst = map.get(first);
    const connectedToSecond = map.get(second);
    connectedToFirst?.forEach((third: number) => {
      if (connectedToSecond?.has(third)) {
        const sortedTriple = [first, second, third].sort((a, b) => a - b);
        uniqueTriples.add(sortedTriple.join(","));
      }
    });
  });

  return Array.from(uniqueTriples).map((triple) =>
    triple.split(",").map(Number)
  );
}

export function generateAllPermutations(n: number, r: number): number[][] {
  const result: number[][] = [];

  function backtrack(combination: number[], start: number) {
    if (combination.length === r) {
      result.push([...combination]);
      return;
    }

    for (let i = start; i < n; i++) {
      combination.push(i);
      backtrack(combination, i + 1);
      combination.pop();
    }
  }

  backtrack([], 0);
  return result;
}

export function sigmoidTransformAdjusted(
  input: number,
  curvature: number,
  medianPoint: number
): number {
  const adjustedX = 2 * (input - medianPoint) + 0.5;
  return 1 / (1 + Math.exp(-curvature * (adjustedX - 0.5)));
}
