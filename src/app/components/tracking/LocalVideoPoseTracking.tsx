"use client";

import React, { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import p5 from "p5";

import styled from "styled-components";

import { useRouter } from "next/navigation";

import { useGameActions, useGameViews } from "@/app/contexts/Game";

import { draw2DKeyPoints } from "@/app/utils/draw";
import { useFile } from "@/app/contexts/File";
import { IKeypoint3D } from "@/app/utils/calculations";

const VideoPoseTracking: React.FC = () => {
  const { videoNet: net, activeSampleSpace, isPaused } = useGameViews();

  const { setVideoPoses: setPoses, togglePause } = useGameActions();

  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  const { push } = useRouter();
  const { file } = useFile();
  const keyPoints = useRef<IKeypoint3D[]>([]);
  const processingFrameRate = useRef<number>(1);

  useEffect(() => {
    let video: p5.MediaElement;
    let scaleFactor = 1;

    const sketch = (p: p5) => {
      p.setup = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        const canvas = p
          .createCanvas(width, height)
          .parent(p5ContainerRef.current!);

        canvas.mouseClicked(() => {
          if (video) video.elt.paused ? video.elt.play() : video.elt.pause();
          togglePause(video.elt.paused);
        });

        if (file) {
          video = p.createVideo(URL.createObjectURL(file));
          video.hide();
          video.noLoop();
          video.autoplay(false);
          video.elt.loop = false;
          video.elt.autoplay = false;
          video.elt.autostart = false;

          (video.elt as HTMLVideoElement).loop = false;
          const isDesktop = () =>
            typeof window !== "undefined" && window.innerWidth >= 1024;

          p.frameRate(isDesktop() ? 60 : 30);
          if (video) {
            video.elt.addEventListener("ended", () => {
              togglePause(true);
              push("/score");
            });
          }
        }
      };

      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current?.getBoundingClientRect() ?? {};
        p.resizeCanvas(width || 1, height || 1);
      };

      p.draw = () => {
        if (video && (video as any).loadedmetadata) {
          if (p.frameCount % processingFrameRate.current === 0) {
            net
              ?.estimatePoses(video.elt as HTMLVideoElement)
              .then((detectedPoses) => {
                if (detectedPoses && detectedPoses.length > 0) {
                  setPoses(detectedPoses);
                  keyPoints.current = detectedPoses[0].keypoints;
                }
              });
          }

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

          p.clear();

          p.image(video, x, y, displayWidth, displayHeight);
          if (keyPoints.current && keyPoints.current.length > 0)
            draw2DKeyPoints(p, keyPoints.current, scaleFactor, x, y);

          if (
            video.elt.duration - 0.2 <= video.elt.currentTime ||
            video.duration() - 0.2 <= video.time()
          ) {
            togglePause(true);
            push("/score");
          }
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      video.elt.remove();
      video.remove();
      p5InstanceRef.current?.remove();
      setPoses([]);
    };
  }, [file, net, push, setPoses, togglePause]);

  useEffect(() => {
    if (activeSampleSpace && processingFrameRate.current !== activeSampleSpace)
      processingFrameRate.current = activeSampleSpace;
  }, [activeSampleSpace]);

  useEffect(() => {
    if (!file) {
      push("/");
    }
  }, [file, push]);
  if (!file) return null;
  return (
    <>
      <Container>
        <CanvasContainer ref={p5ContainerRef}>
          {isPaused && <ResumeButton>Click to Play</ResumeButton>}
        </CanvasContainer>
      </Container>
    </>
  );
};

export default VideoPoseTracking;

const CanvasContainer = styled.div`
  position: absolute;
  z-index: 5;
  width: 100vw;
  height: 100vh;
  top: 0;
  right: 0;
  box-sizing: border-box;
  canvas {
    position: absolute;
    z-index: 5;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    object-fit: contain;
    cursor: pointer;
  }
  video {
    position: absolute;
    z-index: 5;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    object-fit: contain;
  }
`;

const Container = styled.div`
  position: relative;
  height: 100vh
  width: 100vw;
`;

const ResumeButton = styled.h1`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
`;
