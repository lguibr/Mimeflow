"use client";
import React, { useRef, useEffect, useState } from "react";
import p5 from "p5";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";
import YouTube, { YouTubeProps } from "react-youtube";

import { draw2DKeyPoints } from "@/app/utils/draw";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import { IKeypoint3D } from "@/app/utils/calculations";
import ScoreGraph from "@/app/components/score/ScoreGraph";
import ResultScreen from "@/app/components/score/ResultScreen";
import { useRouter } from "next/navigation";

const YoutubePoseTracking: React.FC = () => {
  const searchParams = useSearchParams();
  const youtubeUrl = searchParams.get("youtubeUrl");
  const videoIdParam = searchParams.get("videoId");

  const {
    videoNet: net,
    activeSampleSpace,
    fps,
    similarity,
    score,
  } = useGameViews();
  const {
    setVideoPoses: setPoses,
    setFps,
    setActiveSampleSpace,
    togglePause,
    saveScore,
  } = useGameActions();

  const router = useRouter();

  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();

  // Ref for the hidden video element that plays the captured stream
  const capturedVideoRef = useRef<HTMLVideoElement>(null);

  // Ref for the YouTube player container to get its position
  const youtubeContainerRef = useRef<HTMLDivElement>(null);

  // Ref for the YouTube player instance
  const playerRef = useRef<any>(null);

  // Native offscreen canvas for cropping
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const keyPoints = useRef<IKeypoint3D[]>([]);
  const processingFrameRate = useRef<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const isDesktop = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;

  // Extract Video ID
  const getVideoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : /^[a-zA-Z0-9_-]{11}$/.test(url) ? url : null;
  };

  const videoId = getVideoId(youtubeUrl);

  // Initialize offscreen canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Start Screen Capture
  const startCapture = async () => {
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        } as any, // Type cast for Chrome-specific option
        audio: false,
        selfBrowserSurface: "include", // Allow capturing the current tab
      } as any); // Type cast for selfBrowserSurface support

      if (capturedVideoRef.current) {
        capturedVideoRef.current.srcObject = captureStream;
        capturedVideoRef.current.play();
        setIsCapturing(true);

        // Handle stream stop (user clicks "Stop sharing")
        captureStream.getVideoTracks()[0].onended = () => {
          stopCapture();
        };
      }
    } catch (err) {
      console.error("Error starting screen capture:", err);
    }
  };

  const stopCapture = () => {
    if (capturedVideoRef.current && capturedVideoRef.current.srcObject) {
      const stream = capturedVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      capturedVideoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  // YouTube Player Options
  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());

    // Handle start time from URL
    if (youtubeUrl) {
      try {
        const urlObj = new URL(youtubeUrl);
        const tParam = urlObj.searchParams.get("t");
        if (tParam) {
          const startTime = parseInt(tParam);
          if (!isNaN(startTime)) {
            event.target.seekTo(startTime);
          }
        }
      } catch (e) {
        // Ignore if not a valid URL
      }
    }
  };

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    // 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1) {
      setIsPlaying(true);
      togglePause(false);
    } else if (event.data === 2) {
      setIsPlaying(false);
      togglePause(true);
    } else if (event.data === 0) {
      setIsPlaying(false);
      togglePause(true);
      if (videoId || videoIdParam) {
        saveScore(videoId || videoIdParam || "unknown");
      }
      setShowResult(true);
      stopCapture();
    }
  };

  // Timer for progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        setCurrentTime(playerRef.current.getCurrentTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // P5 Sketch for Pose Detection and Drawing
  useEffect(() => {
    const frameRate = isDesktop() ? 60 : 30;

    const sketch = (p: p5) => {
      p.setup = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.createCanvas(width, height).parent(p5ContainerRef.current!);
        p.frameRate(frameRate);

        // Update offscreen canvas size
        if (offscreenCanvasRef.current) {
          offscreenCanvasRef.current.width = width;
          offscreenCanvasRef.current.height = height;
        }
      };

      p.windowResized = () => {
        if (p5ContainerRef.current) {
          const { width, height } =
            p5ContainerRef.current.getBoundingClientRect();
          p.resizeCanvas(width, height);

          if (offscreenCanvasRef.current) {
            offscreenCanvasRef.current.width = width;
            offscreenCanvasRef.current.height = height;
          }
        }
      };

      p.draw = () => {
        p.clear();

        // Use the captured video stream for detection
        const video = capturedVideoRef.current;
        const offscreenCanvas = offscreenCanvasRef.current;

        if (
          video &&
          !video.paused &&
          !video.ended &&
          video.readyState >= 2 &&
          offscreenCanvas
        ) {
          // Determine crop region based on YouTube container position
          let cropX = 0,
            cropY = 0,
            cropW = video.videoWidth,
            cropH = video.videoHeight;

          if (youtubeContainerRef.current) {
            const rect = youtubeContainerRef.current.getBoundingClientRect();
            const videoW = video.videoWidth;
            const videoH = video.videoHeight;
            const windowW = window.innerWidth;
            const windowH = window.innerHeight;

            // Calculate scale factors
            const scaleX = videoW / windowW;
            const scaleY = videoH / windowH;

            cropX = rect.left * scaleX;
            cropY = rect.top * scaleY;
            cropW = rect.width * scaleX;
            cropH = rect.height * scaleY;
          }

          // Draw cropped video to offscreen canvas using native context
          const ctx = offscreenCanvas.getContext("2d");
          if (ctx) {
            // Clear previous frame
            ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

            // Draw new frame
            try {
              ctx.drawImage(
                video,
                cropX,
                cropY,
                cropW,
                cropH, // Source: crop region
                0,
                0,
                offscreenCanvas.width,
                offscreenCanvas.height // Destination: full offscreen canvas
              );
            } catch (e) {
              console.error("Error drawing video to offscreen canvas:", e);
            }
          }

          // Pose Detection
          const start = Date.now();
          if (p.frameCount % processingFrameRate.current === 0) {
            if (net) {
              try {
                // Pass the native offscreen canvas to MediaPipe
                const detectedPoses = net.detectForVideo(
                  offscreenCanvas,
                  performance.now()
                );

                if (detectedPoses && detectedPoses.landmarks.length > 0) {
                  const end = Date.now();
                  const time = end - start;
                  const fps = 1000 / time;
                  if ((p.frameCount % 10) * processingFrameRate.current === 0)
                    setFps(fps);

                  if (p.frameCount % 5 === 0) {
                    setPoses(detectedPoses);
                  }

                  // Denormalize landmarks for drawing
                  // The landmarks are normalized (0-1) relative to the OFFSCREEN CANVAS (the crop).
                  // We need to map them back to the MAIN CANVAS coordinates.
                  // Main canvas covers the whole screen (or container).
                  // The crop corresponds to the YouTube container rect on the main canvas.

                  // If we drew the crop to fill the offscreen canvas (width, height),
                  // then (0,0) in landmarks -> (0,0) in offscreen -> (rect.left, rect.top) in main.
                  // (1,1) in landmarks -> (width, height) in offscreen -> (rect.right, rect.bottom) in main.

                  let drawX = 0;
                  let drawY = 0;
                  let drawW = p.width;
                  let drawH = p.height;

                  if (youtubeContainerRef.current) {
                    const rect =
                      youtubeContainerRef.current.getBoundingClientRect();
                    // We need these relative to the p5 canvas, which is absolute positioned at 0,0
                    // So rect.left, rect.top are correct if p5 canvas is full screen.
                    drawX = rect.left;
                    drawY = rect.top;
                    drawW = rect.width;
                    drawH = rect.height;
                  }

                  keyPoints.current = detectedPoses.landmarks[0].map(
                    (kp: {
                      x: number;
                      y: number;
                      z: number;
                      visibility?: number;
                    }) => ({
                      ...kp,
                      x: kp.x * drawW + drawX,
                      y: kp.y * drawH + drawY,
                    })
                  ) as unknown as IKeypoint3D[];
                }
              } catch (e: unknown) {
                console.error("Pose detection error:", e);
              }
            }
          }

          // Draw Skeleton
          if (keyPoints.current) {
            // We draw directly on the canvas, 1:1 mapping since we denormalized to canvas coordinates
            draw2DKeyPoints(p, keyPoints.current, 1, 0, 0);
          }
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, [net]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  const handlePlayAgain = () => {
    setShowResult(false);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
    }
  };

  const handleTryAnother = () => {
    router.push("/");
  };

  return (
    <Container>
      {!youtubeUrl && (
        <Placeholder>No video selected. Go back to Home.</Placeholder>
      )}

      <VideoContainer>
        {/* Hidden video element for processing the captured stream */}
        <HiddenVideo ref={capturedVideoRef} muted playsInline />

        {videoId ? (
          <div
            ref={youtubeContainerRef}
            style={{ width: "100%", height: "100%" }}
          >
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              className="youtube-player"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : null}

        <CanvasContainer ref={p5ContainerRef} />

        {!isCapturing && (
          <Overlay>
            <StartButton onClick={startCapture}>
              Start Game & Share Screen
            </StartButton>
            <InstructionText>
              Click to start. Select &quot;This Tab&quot; in the popup window.
            </InstructionText>
          </Overlay>
        )}
      </VideoContainer>

      {showResult && (
        <ResultScreen
          score={score}
          onPlayAgain={handlePlayAgain}
          onTryAnother={handleTryAnother}
        />
      )}
    </Container>
  );
};

export default YoutubePoseTracking;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
`;

const VideoContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .youtube-player {
    width: 100%;
    height: 100%;
  }
`;

const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const HiddenVideo = styled.video`
  display: none; // Hidden from view, used for processing
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
`;

const StartButton = styled.button`
  background: #007f8b;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #005f6b;
  }
`;

const InstructionText = styled.p`
  color: #ccc;
  margin-top: 15px;
  font-size: 14px;
`;

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;
