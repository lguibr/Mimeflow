"use client";
import React, { useRef, useEffect } from "react";
import p5 from "p5";

import Webcam from "react-webcam";

import styled from "styled-components";

import { draw2DKeyPoints } from "@/app/utils/draw";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import { IKeypoint3D } from "@/app/utils/calculations";

interface PoseTrackingProps {
  onVisibleCountChange?: (count: number) => void;
}

const PoseTracking: React.FC<PoseTrackingProps> = ({
  onVisibleCountChange,
}) => {
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
  const lastReportedCount = useRef<number>(-1);

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
        if (p5ContainerRef.current) {
          const { width, height } =
            p5ContainerRef.current.getBoundingClientRect();
          p.resizeCanvas(width, height);
        }
      };

      // Cleanup observer when sketch is removed/re-run (though sketch scope is tricky)
      // Actually, we should attach observer in the outer useEffect, not inside the sketch closure to be safe,
      // but p5 instance needs to be accessible.
      // Let's attach it to the p instance for cleanup or handle it in the return of useEffect.

      p.draw = () => {
        // console.log("WebcamPoseTracking: p.draw");
        if (video && (video as any).loadedmetadata) {
          // Log only once every 60 frames to avoid spam
          if (p.frameCount % 60 === 0) {
          }

          if (p.frameCount % processingFrameRate.current === 0) {
            if (net) {
              const detectedPoses = net.detectForVideo(
                video.elt as HTMLVideoElement,
                performance.now()
              );
              if (detectedPoses && detectedPoses.landmarks.length > 0) {
                if ((p.frameCount % 10) * processingFrameRate.current === 0)
                  setFps(fps);

                // Throttle React state updates
                if (p.frameCount % 5 === 0) {
                  setPoses(detectedPoses);
                }

                // Denormalize landmarks to video pixel coordinates
                const videoW = (video as any).width;
                const videoH = (video as any).height;

                const rawKeypoints = detectedPoses.landmarks[0].map((kp) => ({
                  ...kp,
                  x: kp.x * videoW,
                  y: kp.y * videoH,
                })) as unknown as IKeypoint3D[];

                // Swap Left and Right keypoints for visualization so colors match the mirrored video
                // (User Right Hand -> Screen Right -> Should be Pink/Left to match Dancer's Left Hand)
                const swappedKeypoints = [...rawKeypoints];
                const pairs = [
                  [1, 4],
                  [2, 5],
                  [3, 6],
                  [7, 8],
                  [9, 10],
                  [11, 12],
                  [13, 14],
                  [15, 16],
                  [17, 18],
                  [19, 20],
                  [21, 22],
                  [23, 24],
                  [25, 26],
                  [27, 28],
                  [29, 30],
                  [31, 32],
                ];
                pairs.forEach(([i, j]) => {
                  if (swappedKeypoints[i] && swappedKeypoints[j]) {
                    const temp = swappedKeypoints[i];
                    swappedKeypoints[i] = swappedKeypoints[j];
                    swappedKeypoints[j] = temp;
                  }
                });

                keyPoints.current = swappedKeypoints;
              }
            }
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

          if (p.frameCount % 60 === 0) {
          }

          p.clear();
          p.translate(p.width, 0); // Move the origin to the right side of the canvas
          p.scale(-1, 1); // Flip the canvas horizontally
          p.image(video, x, y, scaledWidth, scaledHeight);

          if (keyPoints?.current) {
            draw2DKeyPoints(p, keyPoints.current, scaleRatio, x, y);

            // Calculate visible points
            const visibleCount = keyPoints.current.filter(
              (kp) => (kp.score ?? kp.visibility ?? 0) > 0.3 // Threshold for visibility
            ).length;

            // Report back to parent, throttled
            if (
              onVisibleCountChange &&
              visibleCount !== lastReportedCount.current &&
              p.frameCount % 10 === 0
            ) {
              lastReportedCount.current = visibleCount;
              onVisibleCountChange(visibleCount);
            }
          }
        } else {
          // Video not ready
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    // ResizeObserver for container changes
    const resizeObserver = new ResizeObserver(() => {
      if (p5InstanceRef.current && p5ContainerRef.current) {
        const { width, height } =
          p5ContainerRef.current.getBoundingClientRect();
        p5InstanceRef.current.resizeCanvas(width, height);
      }
    });

    if (p5ContainerRef.current) {
      resizeObserver.observe(p5ContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (video) {
        video.remove();
        if (video.elt) video.elt.remove();
      }
      p5InstanceRef.current?.remove();
    };
  }, [net, onVisibleCountChange]);

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

  return (
    <Container>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          right: 0,
          display: "none",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <CanvasContainer ref={p5ContainerRef} />
    </Container>
  );
};

export default PoseTracking;

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: transparent;
`;

const CanvasContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
