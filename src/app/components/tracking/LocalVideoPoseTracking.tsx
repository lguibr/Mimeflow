"use client";
import React, { useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import p5 from "p5";

import styled from "styled-components";

import { useRouter } from "next/navigation";

import { useGameActions, useGameViews } from "@/app/contexts/Game";

import { draw2DPose } from "@/app/utils/draw";
import { useFile } from "@/app/contexts/File";

const defaultConfig: poseDetection.PoseNetEstimationConfig = {
  flipHorizontal: false,
};

const VideoPoseTracking: React.FC = () => {
  const { videoNet: net } = useGameViews();
  const { setVideoPoses: setPoses, togglePause } = useGameActions();

  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  const { push } = useRouter();
  const { file } = useFile();

  useEffect(() => {
    let video: p5.Element;
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
          togglePause();
        });

        if (file) {
          video = p.createVideo(URL.createObjectURL(file));
          video.hide();
          p.frameRate(30);

          if (video)
            video.elt.onloadedmetadata = () => {
              if (video) {
                video && video.elt.pause();
                video.elt.onended = () => {
                  console.log(
                    "Video stopped either because it has finished playing or no further data is available."
                  );
                  push("/score");
                };
              }
            };
        }
      };

      p.windowResized = () => {
        const { width, height } =
          p5ContainerRef.current?.getBoundingClientRect() ?? {};
        p.resizeCanvas(width || 1, height || 1);
      };

      p.draw = async () => {
        if (video && (video as any).loadedmetadata) {
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

          if (detectedPoses) {
            setPoses(detectedPoses);
            draw2DPose(p, detectedPoses, scaleFactor, x, y);
          }
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);
  }, [file, net, push, setPoses, togglePause]);

  useEffect(() => {
    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []);

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

export default VideoPoseTracking;

const CanvasContainer = styled.div`
  position: absolute;
  z-index: 9;
  width: 100vw;
  height: 100vh;
  top: 0;
  right: 0;
  box-sizing: border-box;
  canvas {
    position: absolute;
    z-index: 9;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    object-fit: contain;
    cursor: pointer;
  }
  video {
    position: absolute;
    z-index: 9;
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
