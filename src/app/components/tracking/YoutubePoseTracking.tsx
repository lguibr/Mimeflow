"use client";
import React, { useRef, useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import type p5 from "p5";
import styled from "styled-components";
import YouTube, { YouTubeProps } from "react-youtube";

import { draw2DKeyPoints } from "@/app/utils/draw";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import { IKeypoint3D } from "@/app/utils/calculations";
import ResultScreen from "@/app/components/score/ResultScreen";

const YoutubePoseTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const youtubeUrl = searchParams.get("youtubeUrl");
  const videoIdParam = searchParams.get("videoId");

  const { videoNet: net, similarity, score } = useGameViews();
  const {
    setVideoPoses: setPoses,
    setFps,
    togglePause,
    saveScore,
  } = useGameActions();

  const navigate = useNavigate();

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
  const [videoSource, setVideoSource] = useState<"youtube" | "file" | null>(
    null
  );
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const isDesktop = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;

  // Retrieve file passed from Home, if any
  const location = useLocation();

  useEffect(() => {
    // If a file was passed via state (from Home drag & drop), use it
    if (location.state?.file) {
      handleFileUpload(location.state.file);
      // Clear state so we don't re-init on refresh if we don't want to?
      // Actually navigate replace might be better but for now this works.
    } else if (youtubeUrl) {
      setVideoSource("youtube");
    }
  }, [youtubeUrl, location.state]);

  // Extract Video ID
  const getVideoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : /^[a-zA-Z0-9_-]{11}$/.test(url) ? url : null;
  };

  const [videoId, setVideoId] = useState<string | null>(getVideoId(youtubeUrl));
  // Removed unused fileHash state to fix lint warning

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleFileUpload = async (
    msg: React.ChangeEvent<HTMLInputElement> | File
  ) => {
    const file =
      msg instanceof File ? msg : msg.target.files ? msg.target.files[0] : null;

    if (file) {
      try {
        const hash = await calculateFileHash(file);
        // Use hash as the videoId equivalent for leaderboards
        setVideoId(`file-${hash}`);

        const url = URL.createObjectURL(file);
        setUploadedFileUrl(url);
        setVideoSource("file");

        if (capturedVideoRef.current) {
          capturedVideoRef.current.src = url;
          capturedVideoRef.current.play();
          togglePause(false); // Enable scoring
          setIsCapturing(true);
        }
      } catch (err) {
        console.error("Error hashing file:", err);
      }
    }
  };

  // Initialize offscreen canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Start Screen Capture
  const startCapture = async () => {
    // If playing a local file, we don't need screen capture
    if (videoSource === "file") {
      if (capturedVideoRef.current) {
        capturedVideoRef.current.play();
        togglePause(false); // Enable scoring
        setIsCapturing(true);
      }
      return;
    }

    // Check if screen sharing is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert(
        "Screen sharing is not supported on this device or browser. Please try using a desktop computer."
      );
      return;
    }

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
        togglePause(false); // Enable scoring
        setIsCapturing(true);

        // Handle stream stop (user clicks "Stop sharing")
        captureStream.getVideoTracks()[0].onended = () => {
          stopCapture();
        };
      }
    } catch (err: any) {
      console.error("Error starting screen capture:", err);
      // Don't show alert if user just cancelled the selection
      if (err.name !== "NotAllowedError") {
        alert(`Failed to start screen sharing: ${err.message || err}`);
      }
    }
  };

  const stopCapture = () => {
    if (capturedVideoRef.current) {
      if (capturedVideoRef.current.srcObject) {
        const stream = capturedVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        capturedVideoRef.current.srcObject = null;
      }
      capturedVideoRef.current.pause();
    }
    togglePause(true); // Pause scoring
    setIsCapturing(false);
  };

  // YouTube Player Options
  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 0, // Hide default controls
      disablekb: 1, // Disable keyboard controls
      fs: 0, // Hide fullscreen button
      modestbranding: 1,
      rel: 0, // Hide related videos
      showinfo: 0, // Hide video title and uploader (deprecated but good to have)
      iv_load_policy: 3, // Hide video annotations
    },
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;

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
      togglePause(false);
    } else if (event.data === 2) {
      togglePause(true);
    } else if (event.data === 0) {
      togglePause(true);
      if (videoId || videoIdParam) {
        saveScore(videoId || videoIdParam || "unknown");
      }
      setShowResult(true);
      stopCapture();
    }
  };

  // Timer for progress bar

  // P5 Sketch for Pose Detection and Drawing
  useEffect(() => {
    const frameRate = isDesktop() ? 60 : 30;

    const initP5 = async () => {
      try {
        const p5Module = await import("p5");
        const P5 = p5Module.default;

        if (!P5) {
          console.error("Failed to load p5 module");
          return;
        }

        const sketch = (p: p5) => {
          p.setup = () => {
            if (p5ContainerRef.current) {
              const { width, height } =
                p5ContainerRef.current.getBoundingClientRect();
              p.createCanvas(width, height).parent(p5ContainerRef.current);
              p.frameRate(frameRate);

              // Update offscreen canvas size
              if (offscreenCanvasRef.current) {
                offscreenCanvasRef.current.width = width;
                offscreenCanvasRef.current.height = height;
              }
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
                const rect =
                  youtubeContainerRef.current.getBoundingClientRect();
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
                ctx.clearRect(
                  0,
                  0,
                  offscreenCanvas.width,
                  offscreenCanvas.height
                );

                // Draw new frame to offscreen canvas (for MediaPipe detection)
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

                  // If using a file, we want to render the video visible to the user.
                  // Since there is no background YouTube player, we draw the video on the P5 canvas.
                  if (!youtubeContainerRef.current) {
                    // Use native context for performance and robustness
                    const p5Ctx = (p as any)
                      .drawingContext as CanvasRenderingContext2D;
                    if (p5Ctx) {
                      // Draw the FULL offscreen canvas (which contains the processed/cropped frame)
                      // to the FULL p5 canvas.
                      p5Ctx.drawImage(offscreenCanvas, 0, 0, p.width, p.height);
                    }
                  }
                } catch (e) {
                  console.error("Error drawing video:", e);
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
                      if (
                        (p.frameCount % 10) * processingFrameRate.current ===
                        0
                      )
                        setFps(fps);

                      if (p.frameCount % 5 === 0) {
                        setPoses(detectedPoses);
                      }

                      // Denormalize landmarks for drawing
                      let drawX = 0;
                      let drawY = 0;
                      let drawW = p.width;
                      let drawH = p.height;

                      if (youtubeContainerRef.current) {
                        const rect =
                          youtubeContainerRef.current.getBoundingClientRect();
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
                draw2DKeyPoints(p, keyPoints.current, 1, 0, 0);
              }
            }
          };
        };

        p5InstanceRef.current = new P5(sketch);
      } catch (error) {
        console.error("Error initializing p5:", error);
      }
    };

    initP5();

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, [net, videoSource]);

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
    navigate("/");
  };

  return (
    <Container>
      <VideoContainer>
        {/* Hidden video element for processing the captured stream */}
        <HiddenVideo
          ref={capturedVideoRef}
          playsInline
          onEnded={() => {
            if (videoSource === "file") {
              togglePause(true);
              if (videoId) {
                saveScore(videoId);
              }
              setShowResult(true);
              setIsCapturing(false);
            }
          }}
        />

        {videoId && videoSource === "youtube" ? (
          <div
            ref={youtubeContainerRef}
            style={{ width: "100%", height: "100%", cursor: "pointer" }}
            onClick={() => {
              if (playerRef.current) {
                const playerState = playerRef.current.getPlayerState();
                if (playerState === 1) {
                  playerRef.current.pauseVideo();
                } else {
                  playerRef.current.playVideo();
                }
              }
            }}
          >
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              className="youtube-player"
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                transform: "scale(1.35)", // Scale up to hide title, share button, and logo
              }}
            />
          </div>
        ) : null}

        {videoSource === "file" &&
          uploadedFileUrl &&
          // We can just rely on the HiddenVideo playing and the canvas rendering it.
          // But we might want to show the video itself for the user to see what they uploaded
          // instead of just the hidden element.
          // Actually currently the P5 canvas renders the video frame, so we don't need another video element visible.
          // But we need to update the resize logic because 'youtubeContainerRef' won't exist.
          null}

        <CanvasContainer ref={p5ContainerRef} />

        {!isCapturing && (
          <Overlay>
            {!videoSource ? (
              <SelectionContainer>
                <UploadZone
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                  onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <h3>Upload Video File</h3>
                  <p>Drag & Drop or Click to Browse</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </UploadZone>
                {isDesktop() && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ color: "#aaa", fontSize: 14 }}>
                      Or go back to use{" "}
                      <span style={{ color: "#f00" }}>YouTube</span> (Desktop
                      Only • Screen Share)
                    </p>
                  </div>
                )}
              </SelectionContainer>
            ) : videoSource === "youtube" ? (
              <>
                <StartButton onClick={startCapture} onTouchEnd={startCapture}>
                  Start Game & Share Screen
                </StartButton>
                <InstructionText>
                  Experimental Feature: Select &quot;This Tab&quot; in the popup
                  window.
                </InstructionText>
              </>
            ) : (
              // Video Source is file, but not capturing yet?
              // Logic above sets isCapturing=true immediately on upload.
              // So this branch might be unreachable or for replay.
              <StartButton
                onClick={() => {
                  if (capturedVideoRef.current) {
                    capturedVideoRef.current.play();
                    setIsCapturing(true);
                  }
                }}
              >
                Start Game
              </StartButton>
            )}
          </Overlay>
        )}

        {isCapturing && <PerformanceOverlay similarity={similarity} />}
      </VideoContainer>

      {showResult && (
        <ResultScreen
          score={score}
          levelId={videoId || videoIdParam || "unknown"}
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

// Performance Overlay Component
const PerformanceOverlay: React.FC<{ similarity: number }> = ({
  similarity,
}) => {
  const [feedback, setFeedback] = useState<{
    text: string;
    color: string;
    type: "miss" | "okay" | "good" | "great" | "perfect";
  }>({ text: "MISS", color: "#DB4437", type: "miss" });

  // Debounce feedback updates to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (similarity > 0.85) {
        setFeedback({ text: "PERFECT!", color: "#4285F4", type: "perfect" }); // Google Blue
      } else if (similarity > 0.7) {
        setFeedback({ text: "GREAT", color: "#0F9D58", type: "great" }); // Google Green
      } else if (similarity > 0.5) {
        setFeedback({ text: "GOOD", color: "#F4B400", type: "good" }); // Google Yellow
      } else if (similarity > 0.3) {
        setFeedback({ text: "OKAY", color: "#F4B400", type: "okay" }); // Google Yellow (reused)
      } else {
        setFeedback({ text: "MISS", color: "#DB4437", type: "miss" }); // Google Red
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timer);
  }, [similarity]);

  return (
    <PerfContainer>
      <FeedbackWrapper
        key={feedback.text}
        $type={feedback.type}
        $color={feedback.color}
      >
        <PerfText style={{ color: feedback.color }}>{feedback.text}</PerfText>
      </FeedbackWrapper>

      <PerfBarContainer>
        <PerfBarFill
          style={{
            width: `${similarity * 100}%`,
            backgroundColor: feedback.color,
            boxShadow: `0 0 15px ${feedback.color}`,
          }}
        />
      </PerfBarContainer>
      <PerfScore>{Math.round(similarity * 100)}%</PerfScore>
    </PerfContainer>
  );
};

const PerfContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  max-width: 600px;
  background: rgba(20, 20, 20, 0.6); /* Darker background for better contrast */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 16px 32px;
  border-radius: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

// Animations
const shake = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
`;

const bounce = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-15px); }
    60% { transform: translateY(-7px); }
  }
`;

const pulse = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const explode = `
  @keyframes explode {
    0% { transform: scale(0.5); opacity: 0; filter: blur(10px); }
    40% { transform: scale(1.2); opacity: 1; filter: blur(0); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
`;

const glitch = `
  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
`;

const FeedbackWrapper = styled.div<{ $type: string; $color: string }>`
  ${shake}
  ${bounce}
  ${pulse}
  ${explode}
  ${glitch}
  
  min-width: 140px;
  display: flex;
  justify-content: center;

  animation-duration: 0.6s;
  animation-fill-mode: both;

  animation-name: ${({ $type }) =>
    $type === "miss"
      ? "glitch"
      : $type === "okay"
      ? "shake"
      : $type === "good"
      ? "pulse"
      : $type === "great"
      ? "bounce"
      : "explode"}; /* perfect */

  ${({ $type, $color }) =>
    ($type === "perfect" || $type === "great") &&
    `
      filter: drop-shadow(0 0 10px ${$color});
    `}
`;

const PerfText = styled.div`
  font-size: 28px;
  font-weight: 900;
  font-family: "Arial Black", sans-serif;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
`;

const PerfBarContainer = styled.div`
  flex: 1;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const PerfBarFill = styled.div`
  height: 100%;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s;
`;

const PerfScore = styled.div`
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  font-family: "Courier New", monospace;
  min-width: 60px;
  text-align: right;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
`;

const UploadZone = styled.div`
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin-bottom: 8px;
  }

  p {
    color: #aaa;
  }
`;
