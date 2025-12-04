import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import p5 from "p5";
// import * as poseDetection from "@tensorflow-models/pose-detection"; // Removed unused import
import { useGameViews } from "@/app/contexts/Game";
import {
  draw3DGrid,
  drawAxisLines,
  drawPose3D,
  drawRotatingCoordinates,
} from "@/app/utils/draw";
import { useSettings } from "@/app/contexts/Settings";

interface Pose3DViewerProps {
  type: "webcam" | "video";
}

const Pose3DViewer: React.FC<Pose3DViewerProps> = ({ type }) => {
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const { videoPoints3d, webcamPoints3d } = useGameViews();
  const keypoints = type === "webcam" ? webcamPoints3d : videoPoints3d;
  const points = useRef<any[]>(
    type === "webcam" ? webcamPoints3d : videoPoints3d
  );
  const { videoPreview3D, webcamPreview3D } = useSettings();

  useEffect(() => {
    points.current = keypoints;
  }, [keypoints]);

  useEffect(() => {
    if (!p5InstanceRef.current) {
      const sketch = (p: p5) => {
        let canvasWidth: number;
        let canvasHeight: number;

        p.setup = () => {
          const containerRect = p5ContainerRef.current?.getBoundingClientRect();
          canvasWidth = containerRect?.width || p.windowWidth;
          canvasHeight = containerRect?.height || p.windowHeight;
          if (p5ContainerRef.current) {
            p.createCanvas(canvasWidth, canvasHeight, p.WEBGL).parent(
              p5ContainerRef.current
            );
            const isDesktop = () =>
              typeof window !== "undefined" && window.innerWidth >= 1024;

            p.frameRate(isDesktop() ? 60 : 30);
          }
        };

        p.draw = () => {
          let radius = canvasWidth * 2;
          let angle = p.frameCount * 0.08;

          let x = radius * p.cos(angle);
          let z = radius * p.sin(angle);
          let y = canvasHeight * 2 * p.sin(angle / 4);

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
          draw3DGrid(p, canvasWidth, canvasHeight);
        };
      };

      p5InstanceRef.current = new p5(sketch);
    }
  }, [type]);

  return webcamPreview3D && type === "webcam" ? (
    <CanvasContainer ref={p5ContainerRef} />
  ) : videoPreview3D && type === "video" ? (
    <CanvasContainer ref={p5ContainerRef} />
  ) : null;
};

export default Pose3DViewer;

const CanvasContainer = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  position: relative;
  box-sizing: border-box;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
  canvas {
    border-radius: 50%;
  }
`;
