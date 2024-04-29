"use client";

import * as tf from "@tensorflow/tfjs-core";
import { FC } from "react";
import styled from "styled-components";
import * as poseDetection from "@tensorflow-models/pose-detection";

interface IKeypoint3D {
  x: number;
  y: number;
  z?: number;
  score?: number;
  name?: string;
}

const connections = poseDetection.util.getAdjacentPairs(
  poseDetection.SupportedModels.BlazePose
);

function cosineSimilarity(
  poseOne: IKeypoint3D[],
  poseTwo: IKeypoint3D[],
  method: "current" | "noAngles" | "allPermutations"
): number {
  const featuresOne =
    method === "current"
      ? extractFeaturesFromKeypoints(poseOne)
      : method === "noAngles"
      ? extractFeaturesFromKeypointsNoAngles(poseOne)
      : extractFeaturesFromKeypointsAllPermutations(poseOne);
  const featuresTwo =
    method === "current"
      ? extractFeaturesFromKeypoints(poseTwo)
      : method === "noAngles"
      ? extractFeaturesFromKeypointsNoAngles(poseTwo)
      : extractFeaturesFromKeypointsAllPermutations(poseTwo);

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

function extractFeaturesFromKeypoints(keypoints: IKeypoint3D[]): number[] {
  const features: number[] = keypoints.flatMap((keypoint, index) => {
    const score = keypoint.score || 1;
    return [
      keypoint.x * score,
      keypoint.y * score,
      (keypoint.z || 0) * score,
    ].map((feature) => (score < 0.5 ? 0 : feature));
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
      const scores = [
        keypointOne.score,
        keypointTwo.score,
        keypointThree.score,
      ].map((s) => s || 1);
      const averageScore = (scores[0] + scores[1] + scores[2]) / 3;
      if (averageScore >= 0.5) {
        features.push(phi * averageScore, theta * averageScore);
      } else {
        features.push(0, 0);
      }
    }
  });

  return features;
}

function extractFeaturesFromKeypointsNoAngles(
  keypoints: IKeypoint3D[]
): number[] {
  return keypoints.flatMap((keypoint) => {
    const score = keypoint.score || 1;
    return [
      keypoint.x * score,
      keypoint.y * score,
      (keypoint.z || 0) * score,
    ].map((feature) => (score < 0.5 ? 0 : feature));
  });
}

function extractFeaturesFromKeypointsAllPermutations(
  keypoints: IKeypoint3D[]
): number[] {
  const features: number[] = keypoints.flatMap((keypoint, index) => {
    const score = keypoint.score || 1;
    return [
      keypoint.x * score,
      keypoint.y * score,
      (keypoint.z || 0) * score,
    ].map((feature) => (score < 0.5 ? 0 : feature));
  });

  const angleTriples = generateAllPermutations(keypoints.length, 3);
  angleTriples.forEach((triple) => {
    const [firstIndex, secondIndex, thirdIndex] = triple;
    const keypointOne = keypoints[firstIndex];
    const keypointTwo = keypoints[secondIndex];
    const keypointThree = keypoints[thirdIndex];

    if (keypointOne && keypointTwo && keypointThree) {
      const { phi, theta } = calculateSphericalAngles(
        keypointOne,
        keypointTwo,
        keypointThree
      );
      const scores = [
        keypointOne.score,
        keypointTwo.score,
        keypointThree.score,
      ].map((s) => s || 1);
      const averageScore = (scores[0] + scores[1] + scores[2]) / 3;
      if (averageScore >= 0.5) {
        features.push(phi * averageScore, theta * averageScore);
      } else {
        features.push(0, 0);
      }
    }
  });

  return features;
}

function calculateSphericalAngles(
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

function cartesianToSpherical(vector: tf.Tensor): {
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

function generateUniqueTriples(pairs: number[][]): number[][] {
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

function generateAllPermutations(n: number, r: number): number[][] {
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

const Similarity: FC<{
  poseOne: IKeypoint3D[];
  poseTwo: IKeypoint3D[];
}> = ({ poseOne, poseTwo }) => {
  const similarityCurrent = cosineSimilarity(poseOne, poseTwo, "current");
  const similarityNoAngles = cosineSimilarity(poseOne, poseTwo, "noAngles");
  const similarityAllPermutations = cosineSimilarity(
    poseOne,
    poseTwo,
    "allPermutations"
  );

  return (
    <Container>
      <h2>Current Implementation</h2>
      <h1>{similarityCurrent}</h1>
      <h2>No Angles</h2>
      <h1>{similarityNoAngles}</h1>
      <h2>All Permutations</h2>
      <h1>{similarityAllPermutations}</h1>
    </Container>
  );
};

export default Similarity;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  h1,
  h2 {
    color: white;
  }
  h2 {
    margin-top: 20px;
  }
`;
