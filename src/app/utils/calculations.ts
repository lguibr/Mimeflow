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

const JOINT_WEIGHTS: Record<number, number> = {
  // Head / Face can be jittery, low weight
  0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.1, 6: 0.1, 7: 0.1, 8: 0.1, 9: 0.1, 10: 0.1,
  // Torso / Shoulders
  11: 1.0, 12: 1.0, 23: 1.0, 24: 1.0,
  // Arms
  13: 1.5, 14: 1.5, 15: 2.0, 16: 2.0,
  // Legs
  25: 1.5, 26: 1.5, 27: 2.0, 28: 2.0,
  // Hands and Feet
  17: 1.0, 18: 1.0, 19: 1.0, 20: 1.0, 21: 1.0, 22: 1.0,
  29: 1.0, 30: 1.0, 31: 1.0, 32: 1.0,
};

// Helper functions for vector math
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

export function cosineSimilarity(
  poseOne: IKeypoint3D[],
  poseTwo: IKeypoint3D[]
): number {
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
  const features: number[] = [];

  connections.forEach((conn) => {
    const kp1 = keypoints[conn.start];
    const kp2 = keypoints[conn.end];

    if (kp1 && kp2) {
      const score1 = kp1.score ?? kp1.visibility ?? 0;
      const score2 = kp2.score ?? kp2.visibility ?? 0;
      const avgScore = (score1 + score2) / 2;

      const weight1 = JOINT_WEIGHTS[conn.start] ?? 1.0;
      const weight2 = JOINT_WEIGHTS[conn.end] ?? 1.0;
      const weight = (weight1 + weight2) / 2;

      const combinedWeight = avgScore * weight;

      // Only include vectors if both points are reasonably visible
      if (avgScore > 0.3) {
        const vector = [
          kp2.x - kp1.x,
          kp2.y - kp1.y,
          (kp2.z || 0) - (kp1.z || 0)
        ];

        const mag = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2]);

        if (mag > 0) {
          features.push((vector[0] / mag) * combinedWeight);
          features.push((vector[1] / mag) * combinedWeight);
          features.push((vector[2] / mag) * combinedWeight);
        } else {
          features.push(0, 0, 0);
        }
      } else {
        features.push(0, 0, 0);
      }
    } else {
      features.push(0, 0, 0);
    }
  });

  return features;
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
