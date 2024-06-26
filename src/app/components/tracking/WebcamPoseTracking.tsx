"use client";
import React, { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import p5 from "p5";

import Webcam from "react-webcam";

import styled from "styled-components";

import { draw2DKeyPoints } from "@/app/utils/draw";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import usePercentageToPixels from "@/app/hooks/usePercentageToPixels";
import FloatingWindow from "./FloatingWindow";
import { IKeypoint3D } from "@/app/utils/calculations";

const PoseTracking: React.FC = () => {
  const { webcamNet: net, activeSampleSpace, fps } = useGameViews();
  const {
    setWebcamPoses: setPoses,
    setFps,
    setActiveSampleSpace,
  } = useGameActions();
  const webcamRef = useRef<Webcam>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  const keyPoints = useRef<IKeypoint3D[]>([]);
  const processingFrameRate = useRef<number>(1);

  const isDesktop = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;

  useEffect(() => {
    const frameRate = isDesktop() ? 60 : 30;

    let video: p5.Element;
    let scaleRatio = 1;
    const sketch = (p: p5) => {
      p.setup = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.createCanvas(width, height).parent(p5ContainerRef.current!);

        video = p.createCapture((p as any).VIDEO);
        video.hide();

        p.frameRate(frameRate);
      };

      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.resizeCanvas(width, height);
      };

      p.draw = () => {
        if (video && (video as any).loadedmetadata) {
          const start = Date.now();
          if (p.frameCount % processingFrameRate.current === 0) {
            net
              ?.estimatePoses(video.elt as HTMLVideoElement)
              .then((detectedPoses) => {
                if (detectedPoses && detectedPoses.length > 0) {
                  const end = Date.now();
                  const time = end - start;
                  const fps = 1000 / time;
                  if ((p.frameCount % 10) * processingFrameRate.current === 0)
                    setFps(fps);
                  setPoses(detectedPoses);
                  keyPoints.current = detectedPoses[0]?.keypoints;
                }
              });
          }
          const containerHeight = p5ContainerRef.current?.offsetHeight || 1;
          const containerWidth = p5ContainerRef.current?.offsetWidth || 1;
          const videoWidth = (video as any).width;
          const videoHeight = (video as any).height;

          const smallerContainerDimension = Math.min(
            containerHeight,
            containerWidth
          );

          const smallerVideoDimension = Math.min(videoWidth, videoHeight);

          scaleRatio = smallerContainerDimension / smallerVideoDimension;

          const scaledWidth = videoWidth * scaleRatio;
          const scaledHeight = videoHeight * scaleRatio;
          const x = (p.width - scaledWidth) / 2;
          const y = 0;

          p.clear();
          p.translate(p.width, 0); // Move the origin to the right side of the canvas
          p.scale(-1, 1); // Flip the canvas horizontally
          p.image(video, x, y, scaledWidth, scaledHeight);

          if (keyPoints?.current)
            draw2DKeyPoints(p, keyPoints.current, scaleRatio, x, y);
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InstanceRef.current?.remove();
      video.elt.remove();
      video.remove();
    };
  }, [net, setActiveSampleSpace, setFps, setPoses]);
  const getPixels = usePercentageToPixels();

  useEffect(() => {
    const ticker = setInterval(() => {
      const frameRate = isDesktop() ? 60 : 30;
      const timeToRenderFrame = 1000 / frameRate;
      const processFps = fps;
      const timeToProcessFrame = processFps
        ? 1000 / processFps / activeSampleSpace
        : undefined;

      const newCalculatedRatio =
        timeToProcessFrame && Math.ceil(timeToProcessFrame / timeToRenderFrame);

      const haveChanged =
        newCalculatedRatio && newCalculatedRatio !== activeSampleSpace;

      if (haveChanged) {
        processingFrameRate.current = newCalculatedRatio;
        setActiveSampleSpace(newCalculatedRatio);
      }
    }, 1000);
    return () => {
      clearInterval(ticker);
    };
  }, [activeSampleSpace, fps, setActiveSampleSpace]);

  const [x0, y0] = getPixels(0, 0);
  const [x30, y30] = getPixels(30, 30);
  return (
    <FloatingWindow
      x={x0}
      y={y0}
      width={x30 > y30 ? y30 : x30}
      height={x30 > y30 ? y30 : x30}
    >
      <Container>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            right: 0,
            display: "none",
            borderRadius: "50%",
          }}
        />
        <CanvasContainer ref={p5ContainerRef} />
      </Container>
    </FloatingWindow>
  );
};

export default PoseTracking;

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  :after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999999;
    top: 0;
    left: 0;
    border-radius: 50%;
    border: 1px solid #000626ff;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 40%,
      #00062644 60%,
      #000626dd 80%,
      #000626ff 100%
    );
  }
`;

const CanvasContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  box-sizing: border-box;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
  canvas {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &:hover {
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    }
  }

  video {
    position: absolute;
    z-index: 999;
    top: 0;
    right: 0;
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &:hover {
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    }
  }
`;
