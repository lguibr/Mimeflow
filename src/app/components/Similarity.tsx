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
  poseTwo: IKeypoint3D[]
): number {
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

function extractFeaturesFromKeypoints(keypoints: IKeypoint3D[]): number[] {
  const features: number[] = keypoints.flatMap((keypoint, index) => {
    const score = keypoint.score || 1;
    return [
      keypoint.x * score,
      keypoint.y * score,
      (keypoint.z || 0) * score, // Apply the score to z-coordinate, defaulting z to 0
    ].map((feature) => (score < 0.5 ? 0 : feature)); // Apply threshold to each coordinate
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
      // Calculate the average score and apply threshold to angles
      const scores = [
        keypointOne.score,
        keypointTwo.score,
        keypointThree.score,
      ].map((s) => s || 1);
      const averageScore = (scores[0] + scores[1] + scores[2]) / 3;
      if (averageScore >= 0.5) {
        features.push(phi * averageScore, theta * averageScore);
      } else {
        features.push(0, 0); // Set angles to 0 if the average score is below the threshold
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

  // Clean up tensors
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
  const theta = Math.acos(z / r); // Polar angle
  const phi = Math.atan2(y, x); // Azimuthal angle

  return { r, theta, phi };
}

function generateUniqueTriples(pairs: number[][]): number[][] {
  const uniqueTriples = new Set<string>();

  // Create a mapping of each number to all other numbers it's paired with
  const map = new Map<number, Set<number>>();
  pairs.forEach(([a, b]) => {
    if (!map.has(a)) map.set(a, new Set());
    if (!map.has(b)) map.set(b, new Set());
    map.get(a)?.add(b);
    map.get(b)?.add(a);
  });

  // Generate all possible triples
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

  // Convert the set of string triples back to array of number arrays
  return Array.from(uniqueTriples).map((triple) =>
    triple.split(",").map(Number)
  );
}

const Similarity: FC<{
  poseOne: IKeypoint3D[];
  poseTwo: IKeypoint3D[];
}> = ({ poseOne, poseTwo }) => {
  const similarity = cosineSimilarity(poseOne, poseTwo);
  return (
    <Container>
      <h1>{similarity}</h1>
    </Container>
  );
};
export default Similarity;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  h1 {
    color: white;
  }
`;
