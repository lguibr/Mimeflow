import * as poseDetection from "@tensorflow-models/pose-detection";
import p5 from "p5";

const threshold = 0;

export const draw2DPose = (
  p: p5,
  poses: poseDetection.Pose[],
  scale: number,
  offsetX: number,
  offsetY: number
) => {
  p.strokeWeight(1);
  const r = p.random(255);
  p.stroke(p.color(r, r, r, 25));
  p.fill(p.color(r, r, r, 50));
  // Draw skeleton
  const connections = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.BlazePose
  );

  poses?.forEach(({ keypoints }) => {
    // Draw keypoints
    keypoints?.forEach((keypoint) => {
      if (keypoint?.score && keypoint?.score > threshold) {
        p.circle(
          keypoint.x * scale + offsetX,
          keypoint.y * scale + offsetY,
          10
        );
      }
      connections.forEach(([i, j]) => {
        const keypoint1 = keypoints[i];
        const keypoint2 = keypoints[j];

        if (
          keypoint2?.score &&
          keypoint1?.score &&
          keypoint1?.score > threshold &&
          keypoint2?.score > threshold
        ) {
          p.line(
            keypoint1.x * scale + offsetX,
            keypoint1.y * scale + offsetY,
            keypoint2.x * scale + offsetX,
            keypoint2.y * scale + offsetY
          );
        }
      });
    });
  });
};

export const drawPose3D = (
  p: p5,
  keypoints: poseDetection.Keypoint[],
  canvasWidth: number,
  canvasHeight: number
) => {
  const widthFraction = canvasWidth / 6;
  const heightFraction = canvasHeight / 6;
  const noiseR = p.noise(p.frameCount / 1000);
  const noiseG = p.noise((p.frameCount * 2) / 1000);
  const noiseb = p.noise((p.frameCount * 3) / 1000);
  const mappedNoiseR = p.map(noiseR, 0, 1, 0, 255);
  const mappedNoiseG = p.map(noiseG, 0, 1, 0, 255);
  const mappedNoiseB = p.map(noiseb, 0, 1, 0, 255);
  keypoints?.forEach(({ x, y, z, score }) => {
    const mappedX = p.map(x, -1, 1, -widthFraction, widthFraction);
    const mappedY = p.map(y, -1, 1, -heightFraction, heightFraction);
    const mappedZ = p.map(z || 0, -1, 1, -widthFraction, widthFraction);
    if (score && score > threshold) {
      p.push();
      p.translate(mappedX, mappedY, mappedZ);
      p.noStroke();

      p.lights();

      p.ambientMaterial(mappedNoiseB, mappedNoiseG, mappedNoiseR);
      p.ambientLight(mappedNoiseR, mappedNoiseG, mappedNoiseB);

      p.directionalLight(
        p.random(0, mappedNoiseR),
        p.random(0, mappedNoiseG),
        p.random(0, mappedNoiseB),
        p.random(-10, 10),
        p.random(-10, 10),
        p.random(-10, 10)
      );

      p.sphere(canvasHeight / 100);
      p.pop();
    }
  });

  const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.BlazePose
  );

  adjacentKeyPoints.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    const mappedX1 = p.map(kp1.x, -1, 1, -widthFraction, widthFraction);
    const mappedY1 = p.map(kp1.y, -1, 1, -heightFraction, heightFraction);
    const mappedZ1 = p.map(kp1.z || 0, -1, 1, -widthFraction, widthFraction);

    const mappedX2 = p.map(kp2.x, -1, 1, -widthFraction, widthFraction);
    const mappedY2 = p.map(kp2.y, -1, 1, -heightFraction, heightFraction);
    const mappedZ2 = p.map(kp2.z || 0, -1, 1, -widthFraction, widthFraction);

    const k1score = kp1.score || 0;
    const k2score = kp2.score || 0;
    if (k1score + k2score > threshold) {
      p.push();
      p.stroke(255);
      p.strokeWeight(canvasWidth / 100);
      p.line(
        mappedX1,
        mappedY1,
        mappedZ1 || 0,
        mappedX2,
        mappedY2,
        mappedZ2 || 0
      );
      p.pop();
    }
  });
};

export const drawRotatingCoordinates = (
  p: p5,
  canvasWidth: number,
  canvasHeight: number
) => {
  let angle = p.frameCount * 0.01;
  let x = canvasWidth / 2 + p.cos(angle) * 50;
  let y = canvasHeight / 2 + p.sin(angle) * 50;

  p.push();
  p.fill(255);
  p.ellipse(x, y, 10, 10);
  p.pop();
};

export const drawAxisLines = (
  p: p5,
  _canvasWidth: number,
  canvasHeight: number
) => {
  const axisLength = canvasHeight / 3;

  p.push();
  p.strokeWeight(canvasHeight / 60);

  // X-axis (Red)
  p.stroke(p.color(255, 0, 0, 150));
  p.line(0, 0, 0, 0 - axisLength, 0, 0);

  // Y-axis (Green)
  p.stroke(p.color(0, 255, 0, 150));
  p.line(0, 0, 0, 0, 0 - axisLength, 0);

  // Z-axis (Blue)
  p.stroke(p.color(0, 0, 255, 150));

  p.line(0, 0, 0, 0, 0, 0 - axisLength);

  p.pop();
};

export const draw3DGrid = (
  p: p5,
  canvasWidth: number,
  _canvasHeight: number
) => {
  const cubeSize = canvasWidth / 1.5;
  const numCubes = 2;
  const noise = p.noise(p.frameCount / 1000);
  const mappedNoise = p.map(noise, 0, 1, 0, 255);
  p.push();
  p.stroke(p.color(mappedNoise, mappedNoise, mappedNoise, 10));
  p.strokeWeight(canvasWidth / 300);
  p.strokeJoin(p.ROUND);
  p.fill(0, 0, 0, 0);

  for (let x = -numCubes; x < numCubes; x++) {
    for (let y = -numCubes; y < numCubes; y++) {
      for (let z = -numCubes; z < numCubes; z++) {
        p.translate(x * cubeSize, y * cubeSize, z * cubeSize);
        p.box(cubeSize);
        p.translate(-x * cubeSize, -y * cubeSize, -z * cubeSize);
      }
    }
  }

  p.pop();
};
