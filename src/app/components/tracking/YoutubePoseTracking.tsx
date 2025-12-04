"use client";
import React, { useRef, useEffect, useState } from "react";
import p5 from "p5";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";

import { draw2DKeyPoints } from "@/app/utils/draw";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import { IKeypoint3D } from "@/app/utils/calculations";
import ScoreGraph from "@/app/components/score/ScoreGraph";
import ResultScreen from "@/app/components/score/ResultScreen";
import { useRouter } from "next/navigation";

const YoutubePoseTracking: React.FC = () => {
  const searchParams = useSearchParams();
  const youtubeUrl = searchParams.get("youtubeUrl");

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();
  const playerRef = useRef<any>(null); // Type as any to avoid dashjs type issues for now

  const keyPoints = useRef<IKeypoint3D[]>([]);
  const processingFrameRate = useRef<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const isDesktop = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;

  // Initialize Dash.js player
  useEffect(() => {
    console.log("YoutubePoseTracking: useEffect triggered", {
      youtubeUrl,
      videoRef: !!videoRef.current,
    });
    if (youtubeUrl && videoRef.current) {
      const initPlayer = async () => {
        try {
          console.log("YoutubePoseTracking: initPlayer started");
          // Dynamic import dashjs
          const dashjsImport = await import("dashjs");
          const MediaPlayerFactory =
            dashjsImport.MediaPlayer || dashjsImport.default?.MediaPlayer;

          if (!MediaPlayerFactory) {
            console.error(
              "YoutubePoseTracking: MediaPlayer factory not found",
              dashjsImport
            );
            return;
          }

          const videoIdMatch = youtubeUrl.match(
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
          );
          const videoId = videoIdMatch ? videoIdMatch[1] : null;
          console.log("YoutubePoseTracking: videoId extracted", videoId);

          if (videoId) {
            const manifestUrl = `/api/youtube?videoId=${videoId}`;
            console.log("YoutubePoseTracking: manifestUrl", manifestUrl);

            if (playerRef.current) {
              console.log("YoutubePoseTracking: Resetting existing player");
              playerRef.current.reset();
            }

            console.log("YoutubePoseTracking: Creating MediaPlayer");
            const player = MediaPlayerFactory().create();
            console.log(
              "YoutubePoseTracking: Initializing player with",
              manifestUrl
            );
            player.initialize(videoRef.current!, manifestUrl, true);

            player.on("streamInitialized", () => {
              console.log("YoutubePoseTracking: streamInitialized");
              const duration = player.duration();
              setDuration(duration);
              setIsPlaying(true);
              togglePause(false); // Sync global game state: Playing

              // Handle start time from URL (t parameter)
              const urlObj = new URL(youtubeUrl);
              // ... (rest of start time logic)
            });

            // ... (rest of player setup)

            const handleVideoComplete = () => {
              console.log(
                "YoutubePoseTracking: Video completed (end or limit). Calling saveScore and setShowResult."
              );
              player.pause();
              setIsPlaying(false);
              togglePause(true); // Sync global game state: Paused
              if (videoId) {
                console.log(
                  "YoutubePoseTracking: Saving score for video",
                  videoId
                );
                saveScore(videoId);
              }
              setShowResult(true);
            };

            player.on("playbackTimeUpdated", () => {
              const time = player.time();
              setCurrentTime(time);

              // Enforce 59s limit for all videos
              if (time >= 59) {
                handleVideoComplete();
              }
            });

            player.on("playbackEnded", () => {
              console.log("YoutubePoseTracking: playbackEnded event received");
              handleVideoComplete();
            });

            playerRef.current = player;
          } else {
            console.warn("YoutubePoseTracking: Invalid video ID");
          }
        } catch (error) {
          console.error("Error initializing player:", error);
        }
      };
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        console.log("YoutubePoseTracking: Cleanup player");
        playerRef.current.reset();
        playerRef.current = null;
        togglePause(true); // Ensure paused on cleanup
      }
    };
  }, [youtubeUrl, togglePause]); // Added togglePause dependency

  useEffect(() => {
    const frameRate = isDesktop() ? 60 : 30;
    let scaleRatio = 1;

    const sketch = (p: p5) => {
      p.setup = () => {
        const { width, height } =
          p5ContainerRef.current!.getBoundingClientRect();
        p.createCanvas(width, height).parent(p5ContainerRef.current!);
        p.frameRate(frameRate);
      };

      p.windowResized = () => {
        if (p5ContainerRef.current) {
          const { width, height } =
            p5ContainerRef.current.getBoundingClientRect();
          p.resizeCanvas(width, height);
        }
      };

      p.draw = () => {
        p.clear(); // Keep canvas transparent

        if (
          videoRef.current &&
          !videoRef.current.paused &&
          !videoRef.current.ended
        ) {
          const video = videoRef.current;

          // Pose Detection
          const start = Date.now();
          if (p.frameCount % processingFrameRate.current === 0) {
            if (net && video.videoWidth > 0 && video.videoHeight > 0) {
              try {
                const detectedPoses = net.detectForVideo(
                  video,
                  performance.now()
                );
                if (detectedPoses && detectedPoses.landmarks.length > 0) {
                  const end = Date.now();
                  const time = end - start;
                  const fps = 1000 / time;
                  if ((p.frameCount % 10) * processingFrameRate.current === 0)
                    setFps(fps);

                  // Throttle React state updates to avoid "Maximum update depth" error
                  if (p.frameCount % 5 === 0) {
                    setPoses(detectedPoses);
                  }

                  // Denormalize landmarks for drawing
                  const videoW = video.videoWidth;
                  const videoH = video.videoHeight;

                  keyPoints.current = detectedPoses.landmarks[0].map(
                    (kp: {
                      x: number;
                      y: number;
                      z: number;
                      visibility?: number;
                    }) => ({
                      ...kp,
                      x: kp.x * videoW,
                      y: kp.y * videoH,
                    })
                  ) as unknown as IKeypoint3D[];
                }
              } catch (e: unknown) {
                console.error("Pose detection error:", e);
              }
            }
          }

          // Calculate scaling to match object-fit: contain
          const containerWidth = p.width;
          const containerHeight = p.height;
          const videoWidth = video.videoWidth || 1;
          const videoHeight = video.videoHeight || 1;

          const scale = Math.min(
            containerWidth / videoWidth,
            containerHeight / videoHeight
          );

          const scaledWidth = videoWidth * scale;
          const scaledHeight = videoHeight * scale;
          const x = (containerWidth - scaledWidth) / 2;
          const y = (containerHeight - scaledHeight) / 2;

          // Draw Skeleton
          if (keyPoints.current) {
            draw2DKeyPoints(p, keyPoints.current, scale, x, y);
          }
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, [net]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        togglePause(false); // Global: Playing
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        togglePause(true); // Global: Paused
      }
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      togglePause(true); // Global: Paused
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    if (playerRef.current) {
      playerRef.current.seek(0);
      playerRef.current.play();
      setIsPlaying(true);
      togglePause(false);
    }
  };

  const handleTryAnother = () => {
    router.push("/");
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Container>
      {!youtubeUrl && (
        <Placeholder>No video selected. Go back to Home.</Placeholder>
      )}
      <VideoContainer>
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          crossOrigin="anonymous"
          playsInline
        />
        <CanvasContainer ref={p5ContainerRef} />
      </VideoContainer>

      {youtubeUrl && (
        <Controls>
          <ProgressBarContainer>
            <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
            <ProgressBar
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
            />
            <TimeDisplay>{formatTime(duration)}</TimeDisplay>
          </ProgressBarContainer>
          <Buttons>
            <Button onClick={togglePlay}>
              {isPlaying ? (
                <>
                  <span className="icon">⏸</span> Pause
                </>
              ) : (
                <>
                  <span className="icon">▶</span> Play
                </>
              )}
            </Button>
            <Button onClick={stopVideo}>
              <span className="icon">⏹</span> Stop
            </Button>
          </Buttons>
          <SimilarityDisplay>
            Match: {Math.round(similarity * 100)}%
          </SimilarityDisplay>
        </Controls>
      )}
      {showResult && (
        <>
          {console.log("YoutubePoseTracking: Rendering ResultScreen")}
          <ResultScreen
            score={score}
            onPlayAgain={handlePlayAgain}
            onTryAnother={handleTryAnother}
          />
        </>
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

const Controls = styled.div`
  padding: 10px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const ProgressBar = styled.input`
  flex: 1;
  cursor: pointer;
  accent-color: #007f8b;
`;

const TimeDisplay = styled.span`
  font-size: 12px;
  color: #ccc;
  min-width: 40px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Button = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .icon {
    font-size: 16px;
  }
`;

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const SimilarityDisplay = styled.div`
  color: #00ff00;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-top: 5px;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
`;
