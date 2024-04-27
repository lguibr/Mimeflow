"use client";
import React, { useRef, useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import p5 from "p5";
import styled from "styled-components";
import { useRouter } from "next/navigation";

const threshold = 0.4;
const defaultConfig: poseDetection.PoseNetEstimationConfig = {
  flipHorizontal: false,
};

interface PoseTrackingProps {
  net: poseDetection.PoseDetector;
  setPoses: React.Dispatch<React.SetStateAction<poseDetection.Pose[]>>;
  file: File;
  isPlaying: boolean;
  onEnd: () => void;
}

const PoseTracking: React.FC<PoseTrackingProps> = ({
  net,
  setPoses,
  file,
  isPlaying,
  onEnd,
}) => {
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  useEffect(() => {
    const { width, height } =
      p5ContainerRef.current?.getBoundingClientRect() || {};

    const sketch = (p: p5) => {
      let video: p5.MediaElement;
      let scaleFactor = 1;

      p.setup = async () => {
        if (file) {
          video = p.createVideo(URL.createObjectURL(file), () => {
            video.onended(() => {
              video.remove();
              onEnd();
            });
          });
          video.hide();
          await new Promise((resolve) => {
            video.elt.onloadedmetadata = () => {
              resolve(null);
            };
          });
        }
        p.createCanvas(width ?? 1, height ?? 1).parent(p5ContainerRef.current!);
        p.frameRate(40);
      };

      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current?.getBoundingClientRect() ?? {};
        p.resizeCanvas(width || 1, height || 1);
      };

      p.draw = async () => {
        if (video && (video as any).loadedmetadata) {
          if (isPlaying) video.play();
          else video.pause();

          const containerWidth = p5ContainerRef.current?.offsetWidth || 1;
          const containerHeight = p5ContainerRef.current?.offsetHeight || 1;
          const videoWidth = (video as any).width;
          const videoHeight = (video as any).height;
          const aspectRatio = videoWidth / videoHeight;
          let displayWidth = containerWidth;
          let displayHeight = containerWidth / aspectRatio;
          if (displayHeight > containerHeight) {
            displayHeight = containerHeight;
            displayWidth = displayHeight * aspectRatio;
          }
          scaleFactor = displayWidth / videoWidth;
          const x = (containerWidth - displayWidth) / 2;
          const y = (containerHeight - displayHeight) / 2;
          const detectedPoses = await net?.estimatePoses(
            video.elt as HTMLVideoElement,
            defaultConfig
          );
          p.clear();
          p.image(video, x, y, displayWidth, displayHeight);
          setPoses(detectedPoses);
          drawPose(detectedPoses, scaleFactor, x, y);
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
  }, [file, isPlaying, net, setPoses]);

  useEffect(() => {
    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []);

  const { push } = useRouter();

  if (!file) {
    push("/");
    return null;
  }

  return (
    <>
      <Container>
        <CanvasContainer ref={p5ContainerRef}></CanvasContainer>
      </Container>
    </>
  );
};

export default PoseTracking;

const CanvasContainer = styled.div`
  position: absolute;
  z-index: 9999999999;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  box-sizing: border-box;
  canvas {
    position: absolute;
    z-index: 999;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  video {
    position: absolute;
    z-index: 999;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;
