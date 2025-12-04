import p5 from "p5";
import { IKeypoint3D, connections } from "./calculations";

const threshold = 0;

export const draw2DKeyPoints = (
  p: p5,
  keypoints: IKeypoint3D[] | undefined,
  scale: number,
  offsetX: number,
  offsetY: number
) => {
  if (!keypoints) return;

  // Neon Palette
  const colorLeft = p.color(0, 255, 255); // Cyan
  const colorRight = p.color(255, 0, 255); // Magenta
  const colorCenter = p.color(255, 255, 255); // White

  // Draw Skeleton Connections
  p.strokeWeight(4); // Thicker lines
  connections.forEach(({ start: i, end: j }) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    const score1 = kp1?.score ?? kp1?.visibility ?? 0;
    const score2 = kp2?.score ?? kp2?.visibility ?? 0;

    if (kp1 && kp2 && score1 > threshold && score2 > threshold) {
      // Determine color based on side (even is right, odd is left usually, but let's check standard MediaPipe)
      // MediaPipe Pose: 0-10 head, 11/12 shoulders, etc.
      // Odd indices are mostly left, Even are mostly right (except head 0).
      // Let's use a simple heuristic or gradient.

      const isLeft = i % 2 !== 0 || j % 2 !== 0;
      p.stroke(isLeft ? colorLeft : colorRight);

      // Draw line
      p.line(
        kp1.x * scale + offsetX,
        kp1.y * scale + offsetY,
        kp2.x * scale + offsetX,
        kp2.y * scale + offsetY
      );
    }
  });

  // Draw Keypoints with 3D feel
  p.noStroke();
  keypoints.forEach((keypoint, index) => {
    const score = keypoint.score ?? keypoint.visibility ?? 1;
    if (score > threshold) {
      const x = keypoint.x * scale + offsetX;
      const y = keypoint.y * scale + offsetY;
      // Z is usually relative depth. Negative is closer to camera in some systems, positive in others.
      // In MediaPipe world coordinates: Z is meters. In normalized landmarks: Z is scale-relative.
      // Let's assume smaller Z (or negative) is closer -> bigger.
      // We'll map Z roughly. If Z is missing, default to 0.
      const z = keypoint.z || 0;

      // Adjust size based on Z.
      // Assuming Z ranges roughly -0.5 to 0.5 for body depth relative to hips.
      // We want closer points (smaller Z) to be bigger.
      const depthScale = p.map(z, -0.5, 0.5, 1.5, 0.5, true);
      const baseSize = 10 * depthScale;

      // Color based on side
      let col = colorCenter;
      if (index > 0) {
        // 0 is nose
        col = index % 2 !== 0 ? colorLeft : colorRight;
      }

      // Glow effect (outer circle)
      p.fill(p.red(col), p.green(col), p.blue(col), 100);
      p.circle(x, y, baseSize * 2.5);

      // Core (inner circle)
      p.fill(p.red(col), p.green(col), p.blue(col), 255);
      p.circle(x, y, baseSize);

      // Highlight (specular)
      p.fill(255, 255, 255, 200);
      p.circle(x - baseSize * 0.2, y - baseSize * 0.2, baseSize * 0.3);
    }
  });
};

export const drawPose3D = (
  p: p5,
  keypoints: IKeypoint3D[],
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
  keypoints?.forEach(({ x, y, z, score, visibility }) => {
    const mappedX = p.map(x, -1, 1, -widthFraction, widthFraction);
    const mappedY = p.map(y, -1, 1, -heightFraction, heightFraction);
    const mappedZ = p.map(z || 0, -1, 1, -widthFraction, widthFraction);
    const conf = score ?? visibility ?? 0;
    if (conf > threshold) {
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

  connections.forEach(({ start: i, end: j }) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    if (!kp1 || !kp2) return;

    const mappedX1 = p.map(kp1.x, -1, 1, -widthFraction, widthFraction);
    const mappedY1 = p.map(kp1.y, -1, 1, -heightFraction, heightFraction);
    const mappedZ1 = p.map(kp1.z || 0, -1, 1, -widthFraction, widthFraction);

    const mappedX2 = p.map(kp2.x, -1, 1, -widthFraction, widthFraction);
    const mappedY2 = p.map(kp2.y, -1, 1, -heightFraction, heightFraction);
    const mappedZ2 = p.map(kp2.z || 0, -1, 1, -widthFraction, widthFraction);

    const k1score = kp1.score ?? kp1.visibility ?? 0;
    const k2score = kp2.score ?? kp2.visibility ?? 0;
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
