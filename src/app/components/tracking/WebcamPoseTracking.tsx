"use client";
import React, { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import p5 from "p5";

import Webcam from "react-webcam";

import styled from "styled-components";

import { draw2DPose } from "@/app/utils/draw";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import usePercentageToPixels from "@/app/hooks/usePercentageToPixels";
import FloatingWindow from "./FloatingWindow";

const PoseTracking: React.FC = () => {
  const { webcamNet: net } = useGameViews();
  const { setWebcamPoses: setPoses, setFps } = useGameActions();

  const webcamRef = useRef<Webcam>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  useEffect(() => {
    let video: p5.Element;
    let scaleRatio = 1;
    const sketch = (p: p5) => {
      p.setup = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.createCanvas(width, height).parent(p5ContainerRef.current!);

        video = p.createCapture((p as any).VIDEO);
        video.hide();

        const isDesktop = () =>
          typeof window !== "undefined" && window.innerWidth >= 1024;

        p.frameRate(isDesktop() ? 60 : 30);
      };

      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.resizeCanvas(width, height);
      };

      p.draw = async () => {
        if (video && (video as any).loadedmetadata) {
          const start = Date.now();
          const containerHeight = p5ContainerRef.current?.offsetHeight || 1;
          const videoWidth = (video as any).width;
          const videoHeight = (video as any).height;

          scaleRatio = containerHeight / videoHeight;

          const scaledWidth = videoWidth * scaleRatio;
          const scaledHeight = videoHeight * scaleRatio;
          const x = (p.width - scaledWidth) / 2;
          const y = 0;

          const detectedPoses = await net?.estimatePoses(
            video.elt as HTMLVideoElement
          );

          p.clear();
          p.translate(p.width, 0); // Move the origin to the right side of the canvas
          p.scale(-1, 1); // Flip the canvas horizontally
          p.image(video, x, y, scaledWidth, scaledHeight);

          if (detectedPoses) {
            setPoses(detectedPoses);
            draw2DPose(p, detectedPoses, scaleRatio, x, y);
          }
          const end = Date.now();
          const fps = 1000 / (end - start);
          if (p.frameCount % 20 === 0) setFps(fps);
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InstanceRef.current?.remove();
      video.elt.remove();
      video.remove();
    };
  }, [net, setFps, setPoses]);
  const getPixels = usePercentageToPixels();

  const [x0, y0] = getPixels(0, 0);
  const [x100, y100] = getPixels(100, 100);
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
