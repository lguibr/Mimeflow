import { PoseLandmarker } from "@mediapipe/tasks-vision";

export interface IKeypoint3D {
  x: number;
  y: number;
  z?: number;
  score?: number;
  name?: string;
  visibility?: number;
  presence?: number;
}

// MediaPipe Pose Connections
export const connections = PoseLandmarker.POSE_CONNECTIONS;

function findMidpoint(point1: IKeypoint3D, point2: IKeypoint3D): IKeypoint3D {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    z: ((point1.z || 0) + (point2.z || 0)) / 2,
  };
}

const getHipsMiddlePoint = (points: IKeypoint3D[]): IKeypoint3D => {
  // MediaPipe landmarks don't have names by default in the array, but we can map indices if needed.
  // However, the original code seems to rely on names which might not be present in the raw array from MediaPipe.
  // We should probably update this to use indices if possible, or ensure we map names.
  // For now, let's assume points might not have names and we should use indices.
  // Left Hip: 23, Right Hip: 24
  const rightHip = points[24];
  const leftHip = points[23];
  if (rightHip && leftHip) return findMidpoint(leftHip, rightHip);
  return {
    x: 0,
    y: 0,
    z: 0,
  };
};

const getShoulderMiddlePoint = (points: IKeypoint3D[]) => {
  // Left Shoulder: 11, Right Shoulder: 12
  const rightShoulder = points[12];
  const leftShoulder = points[11];
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

// Helper functions for vector math
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
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

  const dot = dotProduct(featuresOne, featuresTwo);
  const mag1 = magnitude(featuresOne);
  const mag2 = magnitude(featuresTwo);

  if (mag1 === 0 || mag2 === 0) return 0;

  return dot / (mag1 * mag2);
}

export function extractFeaturesFromKeypoints(
  keypoints: IKeypoint3D[]
): number[] {
  const features: number[] = keypoints.flatMap((keypoint) => {
    // We can't rely on names anymore if we just pass the array.
    // We should probably use index based weights if needed, or just default to 1.
    // For now, let's assume default weight 1 if name lookup fails.
    // Or we could map indices to names.
    const scoreWeighted = keypoint.score || keypoint.visibility || 1;

    // TODO: Implement index-based weight lookup if critical.
    const defaultWeight = 1;

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
        keypointOne.score || keypointOne.visibility || 0,
        keypointTwo.score || keypointTwo.visibility || 0,
        keypointThree.score || keypointThree.visibility || 0,
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
    (keypointOne?.score || keypointOne?.visibility || 0) +
    (keypointTwo?.score || keypointTwo?.visibility || 0) +
    (keypointThree?.score || keypointThree?.visibility || 0);
  const averageScore = scoreSum / 3;

  const vectorOne = [
    (keypointTwo.x - keypointOne.x) * averageScore,
    (keypointTwo.y - keypointOne.y) * averageScore,
    ((keypointTwo.z || 0) - (keypointOne.z || 0)) * averageScore,
  ];

  const vectorTwo = [
    (keypointThree.x - keypointTwo.x) * averageScore,
    (keypointThree.y - keypointTwo.y) * averageScore,
    ((keypointThree.z || 0) - (keypointTwo.z || 0)) * averageScore,
  ];

  const vectorOneSpherical = cartesianToSpherical(vectorOne);
  const vectorTwoSpherical = cartesianToSpherical(vectorTwo);

  const thetaDifference = Math.abs(
    vectorOneSpherical.theta - vectorTwoSpherical.theta
  );
  const phiDifference = Math.abs(
    vectorOneSpherical.phi - vectorTwoSpherical.phi
  );

  return { theta: thetaDifference, phi: phiDifference };
}

export function cartesianToSpherical(vector: number[]): {
  r: number;
  theta: number;
  phi: number;
} {
  const x = vector[0];
  const y = vector[1];
  const z = vector[2];

  const r = Math.sqrt(x * x + y * y + z * z);
  // Avoid division by zero if r is 0
  const theta = r === 0 ? 0 : Math.acos(z / r);
  const phi = Math.atan2(y, x);

  return { r, theta, phi };
}

export function generateUniqueTriples(
  pairs: { start: number; end: number }[]
): number[][] {
  const uniqueTriples = new Set<string>();

  const map = new Map<number, Set<number>>();
  pairs.forEach(({ start: a, end: b }) => {
    if (!map.has(a)) map.set(a, new Set());
    if (!map.has(b)) map.set(b, new Set());
    map.get(a)?.add(b);
    map.get(b)?.add(a);
  });

  pairs.forEach(({ start: first, end: second }) => {
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

export function mirrorLandmarks(landmarks: IKeypoint3D[]): IKeypoint3D[] {
  if (!landmarks || landmarks.length === 0) return [];

  const mirrored = [...landmarks];

  // Pairs of indices to swap (Left <-> Right)
  // Based on MediaPipe Pose Landmark topology
  const pairs = [
    [1, 4], // left_eye_inner, right_eye_inner
    [2, 5], // left_eye, right_eye
    [3, 6], // left_eye_outer, right_eye_outer
    [7, 8], // left_ear, right_ear
    [9, 10], // mouth_left, mouth_right
    [11, 12], // left_shoulder, right_shoulder
    [13, 14], // left_elbow, right_elbow
    [15, 16], // left_wrist, right_wrist
    [17, 18], // left_pinky, right_pinky
    [19, 20], // left_index, right_index
    [21, 22], // left_thumb, right_thumb
    [23, 24], // left_hip, right_hip
    [25, 26], // left_knee, right_knee
    [27, 28], // left_ankle, right_ankle
    [29, 30], // left_heel, right_heel
    [31, 32], // left_foot_index, right_foot_index
  ];

  // Swap pairs
  pairs.forEach(([i, j]) => {
    if (mirrored[i] && mirrored[j]) {
      const temp = { ...mirrored[i] };
      mirrored[i] = { ...mirrored[j] };
      mirrored[j] = temp;
    }
  });

  // Negate X coordinate for all landmarks to mirror geometry
  return mirrored.map((point) => ({
    ...point,
    x: point.x * -1,
  }));
}
