"use client";
import React, { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import Webcam from "react-webcam";
import {
  LegacyMultiPersonInferenceConfig,
  LegacySinglePersonInferenceConfig,
} from "@tensorflow-models/posenet/dist/posenet_model";
import p5 from "p5";
import styled from "styled-components";
import "@mediapipe/pose";

const threshold = 0.4;

const defaultConfig:
  | LegacySinglePersonInferenceConfig
  | LegacyMultiPersonInferenceConfig = {
  decodingMethod: "single-person",
  flipHorizontal: false,
};

interface PoseTrackingProps {
  net: poseDetection.PoseDetector;
  poses: poseDetection.Pose[];
  setPose: React.Dispatch<React.SetStateAction<poseDetection.Pose[]>>;
}

const PoseTracking: React.FC<PoseTrackingProps> = ({ net, poses, setPose }) => {
  const webcamRef = useRef<Webcam>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();
  console.log("poses");
  console.log(poses);

  useEffect(() => {
    const sketch = (p: p5) => {
      let video: p5.Element;
      let scaleRatio = 1;

      p.setup = async () => {
        console.log("setup");
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.createCanvas(width, height).parent(p5ContainerRef.current!);
        const VIDEO: any = (p as any).VIDEO;
        video = p.createCapture(VIDEO);
        video.size(640, 480);
        video.hide();
        p.frameRate(120);
      };

      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.resizeCanvas(width, height);
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

          const detectedPoses = await net?.estimatePoses(
            video.elt as HTMLVideoElement,
            defaultConfig
          );

          p.clear();
          p.image(video, x, y, scaledWidth, scaledHeight);

          if (detectedPoses && detectedPoses.length > 0) {
            setPose(detectedPoses);
            drawPose(detectedPoses, scaleRatio, x, y);
          }
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
  }, [net, setPose]);

  return (
    <Container>
      <Webcam
        ref={webcamRef}
        style={{
          width: 640,
          height: 480,
          position: "absolute",
          right: 0,
          border: "4px dotted blue",
        }}
      />
      <CanvasContainer ref={p5ContainerRef} />
    </Container>
  );
};

export default PoseTracking;

const Container = styled.div`
  position: relative;
  border: 10px dotted red;
`;

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
