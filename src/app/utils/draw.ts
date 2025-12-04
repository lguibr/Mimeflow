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

  // Material Design Palette
  const colors = {
    blue: p.color("#4285F4"),
    red: p.color("#EA4335"),
    yellow: p.color("#FBBC05"),
    green: p.color("#34A853"),
    purple: p.color("#9C27B0"),
    white: p.color("#FFFFFF"),
    black: p.color("#000000"),
  };

  // Define connection styles
  const getConnectionColor = (start: number, end: number) => {
    // Torso
    if (
      (start === 11 && end === 12) ||
      (start === 11 && end === 23) ||
      (start === 12 && end === 24) ||
      (start === 23 && end === 24)
    ) {
      return colors.blue;
    }

    // Arms
    if (start === 11 && end === 13) return colors.yellow; // Left Upper Arm
    if (start === 13 && end === 15) return colors.blue; // Left Lower Arm
    if (start === 12 && end === 14) return colors.red; // Right Upper Arm
    if (start === 14 && end === 16) return colors.green; // Right Lower Arm

    // Legs
    if (start === 23 && end === 25) return colors.red; // Left Upper Leg
    if (start === 25 && end === 27) return colors.yellow; // Left Lower Leg
    if (start === 24 && end === 26) return colors.blue; // Right Upper Leg
    if (start === 26 && end === 28) return colors.green; // Right Lower Leg

    // Face
    if (start <= 10 && end <= 10) return colors.yellow;

    return colors.white;
  };

  // Draw Skeleton Connections
  p.strokeWeight(6); // Thicker, bolder lines
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);

  connections.forEach(({ start: i, end: j }) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    const score1 = kp1?.score ?? kp1?.visibility ?? 0;
    const score2 = kp2?.score ?? kp2?.visibility ?? 0;

    if (kp1 && kp2 && score1 > threshold && score2 > threshold) {
      const col = getConnectionColor(i, j);
      p.stroke(col);

      p.line(
        kp1.x * scale + offsetX,
        kp1.y * scale + offsetY,
        kp2.x * scale + offsetX,
        kp2.y * scale + offsetY
      );
    }
  });

  // Calculate body scale based on shoulder distance
  let bodyScale = 1;
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];

  if (
    leftShoulder &&
    rightShoulder &&
    (leftShoulder.score ?? 0) > threshold &&
    (rightShoulder.score ?? 0) > threshold
  ) {
    const dx = (leftShoulder.x - rightShoulder.x) * scale;
    const dy = (leftShoulder.y - rightShoulder.y) * scale;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Base the scale on a reference shoulder width (e.g., 100px is "normal" scale 1)
    // Adjust this divisor to tune the relative size of the balls
    bodyScale = Math.max(0.2, Math.min(distance / 80, 4));
  } else {
    // Fallback to hips if shoulders aren't visible
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    if (
      leftHip &&
      rightHip &&
      (leftHip.score ?? 0) > threshold &&
      (rightHip.score ?? 0) > threshold
    ) {
      const dx = (leftHip.x - rightHip.x) * scale;
      const dy = (leftHip.y - rightHip.y) * scale;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Hips are usually narrower than shoulders, so adjust divisor
      bodyScale = Math.max(0.2, Math.min(distance / 60, 4));
    }
  }

  // Draw Keypoints
  p.noStroke();
  keypoints.forEach((keypoint, index) => {
    const score = keypoint.score ?? keypoint.visibility ?? 1;
    if (score > threshold) {
      const x = keypoint.x * scale + offsetX;
      const y = keypoint.y * scale + offsetY;
      const z = keypoint.z || 0;

      // Depth scaling combined with body scale
      const depthScale = p.map(z, -0.5, 0.5, 1.2, 0.8, true);
      const baseSize = 8 * depthScale * bodyScale; // Reduced base size multiplier since bodyScale handles the bulk

      // Color mapping for joints
      let col = colors.white;
      if (index === 0) col = colors.purple; // Nose
      else if (index >= 1 && index <= 10) col = colors.yellow; // Face
      else if (index === 11 || index === 12) col = colors.blue; // Shoulders
      else if (index === 13 || index === 14) col = colors.yellow; // Elbows
      else if (index === 15) col = colors.blue; // Left Wrist
      else if (index === 16) col = colors.green; // Right Wrist
      else if (index === 23 || index === 24) col = colors.blue; // Hips
      else if (index === 25 || index === 26) col = colors.red; // Knees
      else if (index === 27) col = colors.yellow; // Left Ankle
      else if (index === 28) col = colors.green; // Right Ankle

      // Draw with "Material" style: Solid circle with white border
      // Outer border (Halo) - slightly transparent white
      p.fill(255, 255, 255, 100);
      p.circle(x, y, baseSize + 4 * bodyScale);

      // Inner Color - 70% Opacity (~180/255)
      const r = p.red(col);
      const g = p.green(col);
      const b = p.blue(col);
      p.fill(r, g, b, 180);
      p.circle(x, y, baseSize);

      // Subtle shine
      p.fill(255, 255, 255, 80);
      p.circle(x - baseSize * 0.2, y - baseSize * 0.2, baseSize * 0.4);
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
