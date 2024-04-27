import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import p5 from "p5";
import * as poseDetection from "@tensorflow-models/pose-detection";

interface Pose3DViewerProps {
  keypoints: poseDetection.Keypoint[];
}

const threshold = 0;

const Pose3DViewer: React.FC<Pose3DViewerProps> = ({ keypoints }) => {
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const points = useRef<poseDetection.Keypoint[]>(keypoints);

  useEffect(() => {
    points.current = keypoints;
  }, [keypoints]);

  useEffect(() => {
    if (!p5InstanceRef.current) {
      const sketch = (p: p5) => {
        let canvasWidth: number;
        let canvasHeight: number;

        p.setup = () => {
          // Get the parent container's dimensions on setup
          const containerRect = p5ContainerRef.current?.getBoundingClientRect();
          canvasWidth = containerRect?.width || p.windowWidth;
          canvasHeight = containerRect?.height || p.windowHeight;

          p.createCanvas(canvasWidth, canvasHeight, p.WEBGL).parent(
            p5ContainerRef.current!
          );
          p.frameRate(30);
        };

        p.draw = () => {
          let radius = canvasWidth * 2; // Set the radius of the circle
          let angle = p.frameCount * 0.08; // This controls the speed of rotation

          // Calculate x and y coordinates for circular motion
          let x = radius * p.cos(angle);
          let z = radius * p.sin(angle);
          let y = canvasHeight * 2 * p.sin(angle / 4);

          // const lightPosition = p.createVector(x, 0, z);

          p.camera(
            x, // X coordinate
            y, // Y coordinate
            z, // Z coordinate (distance from the camera to the origin)
            0, // X coordinate of the point the camera is looking at
            0, // Y coordinate of the point the camera is looking at
            0 // Z coordinate of the point the camera is looking at
          );
          p.clear();

          if (points.current.length > 0) {
            drawPose3D(p, points.current, canvasWidth, canvasHeight);
          } else {
            // Draw rotating coordinates when no keypoints
            drawRotatingCoordinates(p, canvasWidth, canvasHeight);
          }
          drawAxisLines(p, canvasWidth, canvasHeight);
          draw3DGrid(p, canvasWidth, canvasHeight); // Add the grid drawing
        };

        const drawAxisLines = (
          p: p5,
          _canvasWidth: number,
          canvasHeight: number
        ) => {
          const axisLength = canvasHeight / 3; // Adjust length as needed

          p.push();
          p.strokeWeight(10);

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

        const drawPose3D = (
          p: p5,
          keypoints: poseDetection.Keypoint[],
          canvasWidth: number,
          canvasHeight: number
        ) => {
          keypoints?.forEach(({ x, y, z, score }) => {
            const mappedX = p.map(x, -1, 1, -canvasWidth / 2, canvasWidth / 2);
            const mappedY = p.map(
              y,
              -1,
              1,
              -canvasHeight / 2,
              canvasHeight / 2
            );
            const mappedZ = p.map(
              z || 0,
              -1,
              1,
              -canvasWidth / 2,
              canvasWidth / 2
            );
            if (score && score > threshold) {
              p.push();
              p.translate(mappedX, mappedY, mappedZ);
              p.noStroke();
              p.ambientMaterial(150, 150, 150);

              p.lights();

              p.ambientLight(
                p.random(0, 255),
                p.random(0, 255),
                p.random(0, 255)
              );
              p.directionalLight(
                p.random(0, 255),
                p.random(0, 255),
                p.random(0, 255),
                p.random(-10, 10),
                p.random(-10, 10),
                p.random(-10, 10)
              );

              p.sphere(p.height / 50);
              p.pop();
            }
          });

          const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
            poseDetection.SupportedModels.BlazePose
          );

          adjacentKeyPoints.forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            const mappedX1 = p.map(
              kp1.x,
              -1,
              1,
              -canvasWidth / 2,
              canvasWidth / 2
            );
            const mappedY1 = p.map(
              kp1.y,
              -1,
              1,
              -canvasHeight / 2,
              canvasHeight / 2
            );
            const mappedZ1 = p.map(
              kp1.z || 0,
              -1,
              1,
              -canvasWidth / 2,
              canvasWidth / 2
            );

            const mappedX2 = p.map(
              kp2.x,
              -1,
              1,
              -canvasWidth / 2,
              canvasWidth / 2
            );
            const mappedY2 = p.map(
              kp2.y,
              -1,
              1,
              -canvasHeight / 2,
              canvasHeight / 2
            );
            const mappedZ2 = p.map(
              kp2.z || 0,
              -1,
              1,
              -canvasWidth / 2,
              canvasWidth / 2
            );

            const k1score = kp1.score || 0;
            const k2score = kp2.score || 0;
            if (k1score + k2score > threshold) {
              p.push();
              p.stroke(255);
              p.strokeWeight(8);
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
        // Add the drawGrid function
        const draw3DGrid = (
          p: p5,
          _canvasWidth: number,
          _canvasHeight: number
        ) => {
          const cubeSize = 150; // Size of each cube
          const numCubes = 2; // Number of cubes per axis (total cubes = numCubes^3)

          p.push();
          p.stroke(255); // White stroke for visibility
          p.strokeWeight(0.3); // Thin stroke weight
          p.strokeJoin(p.ROUND); // Round stroke ends
          p.fill(0, 0, 0, 0); // Black fill

          // Loop through x, y, z coordinates to create cubes
          for (let x = -numCubes; x < numCubes; x++) {
            for (let y = -numCubes; y < numCubes; y++) {
              for (let z = -numCubes; z < numCubes; z++) {
                p.translate(x * cubeSize, y * cubeSize, z * cubeSize); // Move to cube position
                p.box(cubeSize); // Draw the cube
                p.translate(-x * cubeSize, -y * cubeSize, -z * cubeSize); // Move back to origin
              }
            }
          }

          p.pop();
        };
        const drawRotatingCoordinates = (
          p: p5,
          canvasWidth: number,
          canvasHeight: number
        ) => {
          // Replace with your desired visualization
          // This example just draws a rotating point
          let angle = p.frameCount * 0.01;
          let x = canvasWidth / 2 + p.cos(angle) * 50;
          let y = canvasHeight / 2 + p.sin(angle) * 50;

          p.push();
          p.fill(255);
          p.ellipse(x, y, 10, 10);
          p.pop();
        };
      };

      p5InstanceRef.current = new p5(sketch);
    }

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []); // This effect should run once to set up the p5 sketch

  return <CanvasContainer ref={p5ContainerRef} />;
};

export default Pose3DViewer;

const CanvasContainer = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  position: relative;
  border: 10px dashed gold;
  box-sizing: border-box;
  border-radius: 50%;
  canvas {
    border-radius: 50%;
  }
`;
