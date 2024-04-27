"use client";

import React, { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";

import p5 from "p5";
import styled from "styled-components";

const threshold = 0.4;

const defaultConfig: poseDetection.PoseNetEstimationConfig = {
  flipHorizontal: false,
};

const PoseTracking: React.FC<{ net: poseDetection.PoseDetector }> = ({
  net,
}) => {
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  useEffect(() => {
    let isPaused = true;
    const sketch = (p: p5) => {
      let video: p5.MediaElement;
      let scaleRatio = 1;

      p.setup = async () => {
        video = p.createVideo("/video.mp4", (a) => {});
        video.hide();

        // Wait for the video to load
        await new Promise((resolve) => {
          video.elt.onloadedmetadata = () => {
            resolve(null);
          };
        });
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();

        p.createCanvas(width, height).parent(p5ContainerRef.current!);

        p.frameRate(120);
      };
      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.resizeCanvas(width, height);
      };
      p.mousePressed = () => {
        console.log("clicked");

        if (isPaused) {
          video?.play();
          isPaused = !isPaused;
        } else {
          video?.pause();
          isPaused = !isPaused;
        }
      };

      p.draw = async () => {
        if (video && (video as any).loadedmetadata) {
          const containerHeight = p5ContainerRef.current!.offsetHeight;
          const videoWidth = (video as any).width;
          const videoHeight = (video as any).height;

          scaleRatio = containerHeight / videoHeight;

          const scaledWidth = videoWidth * scaleRatio;
          const scaledHeight = videoHeight * scaleRatio;
          const x = (p.width - scaledWidth) / 2;
          const y = 0;

          const poses = await net?.estimatePoses(
            video.elt as HTMLVideoElement,
            defaultConfig
          );

          p.clear();
          p.image(video, x, y, scaledWidth, scaledHeight);
          drawPose(poses, scaleRatio, x, y);
        }
      };

      const drawPose = (
        poses: poseDetection.Pose[],
        scale: number,
        offsetX: number,
        offsetY: number
      ) => {
        p.strokeWeight(2);
        p.stroke("blue");
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
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, [net]);

  return (
    <Container>
      <CanvasContainer ref={p5ContainerRef} />
    </Container>
  );
};

export default PoseTracking;

const CanvasContainer = styled.div`
  position: absolute;
  z-index: 9999999999;
  border: 10px dotted black;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;

  canvas {
    position: absolute;
    z-index: 9999999999;
    border: 10px dotted black;
    top: 0;
    right: 0;
  }

  video {
    position: absolute;
    z-index: 9999999999;
    border: 10px dotted black;
    top: 0;
    right: 0;
  }
`;

const Container = styled.div`
  position: relative;
  border: 10px dotted red;
`;
