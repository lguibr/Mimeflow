import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "@/components/ui/badge";
import Logo from "@/app/components/core/Logo";
import WebcamPoseTracking from "@/app/components/tracking/WebcamPoseTracking";

export default function Home() {
  const [url, setUrl] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/tracking?youtubeUrl=${encodeURIComponent(url)}`);
    }
  };

  // Calculate progress and color
  const progress = visibleCount / 33;
  let borderColor = "#DB4437"; // Red
  if (visibleCount === 33) borderColor = "#0F9D58"; // Green
  else if (visibleCount > 20) borderColor = "#F4B400"; // Yellow

  // Feedback Message Logic
  const [feedback, setFeedback] = useState("Waiting for you...");
  const [displayedFeedback, setDisplayedFeedback] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (visibleCount === 0) setFeedback("Are you a ghost? I see nothing!");
      else if (visibleCount < 10)
        setFeedback("I see a hand... or maybe a foot? Step back!");
      else if (visibleCount < 20)
        setFeedback("Okay, half a human detected. Where's the rest?");
      else if (visibleCount < 30)
        setFeedback("Looking good! Just missing a few bits.");
      else if (visibleCount < 33)
        setFeedback("So close! Don't be shy, show it all!");
      else setFeedback("Perfection! I can see all of you. Ready to rock!");
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [visibleCount]);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setDisplayedFeedback("");
    const typingInterval = setInterval(() => {
      i++;
      if (i <= feedback.length) {
        setDisplayedFeedback(feedback.slice(0, i));
      } else {
        clearInterval(typingInterval);
      }
    }, 30); // Typing speed

    return () => clearInterval(typingInterval);
  }, [feedback]);

  return (
    <Container>
      <BackgroundWrapper>
        <WebcamPoseTracking onVisibleCountChange={setVisibleCount} />
      </BackgroundWrapper>
      <Card $progress={progress} $color={borderColor}>
        <Title>
          <Logo width="300px" height="150px" />
          <Badge
            variant="beta"
            className="absolute top-0 right-0 rotate-12 translate-x-4 -translate-y-2"
          >
            Beta
          </Badge>
        </Title>
        <Subtitle>Upload a video to start matching poses.</Subtitle>

        <UploadContainer
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) {
              const file = e.dataTransfer.files[0];
              // Navigate with file object in state
              navigate("/tracking", { state: { file } });
            }
          }}
        >
          <UploadIcon>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </UploadIcon>
          <h3>Drag & Drop Video</h3>
          <p>or click to browse</p>
          <HiddenInput
            type="file"
            accept="video/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const file = e.target.files[0];
                navigate("/tracking", { state: { file } });
              }
            }}
          />
        </UploadContainer>

        {isDesktop && (
          <SecondarySection>
            <Divider>
              <span>or use YouTube (Desktop Only • Screen Share)</span>
            </Divider>

            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Paste YouTube Link or ID"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <SmallButton type="submit">Go</SmallButton>
            </Form>
          </SecondarySection>
        )}

        <FeedbackText $color={borderColor}>
          {displayedFeedback}
          <Cursor>|</Cursor>
        </FeedbackText>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* Let global background show through */
  position: relative; /* Create stacking context */
  overflow: hidden;
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Base level */
  opacity: 0.6;
`;

const Card = styled.div<{ $progress: number; $color: string }>`
  position: relative;
  z-index: 10; /* Ensure it's above the background */
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 60px;
  border-radius: 24px;
  text-align: center;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  /* Base border (track) */
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* Progress Border */
  &::before {
    content: "";
    position: absolute;
    inset: -5px; /* Thicker border width */
    border-radius: 29px; /* Match card radius + border width */
    padding: 5px; /* Thicker border width */
    background: conic-gradient(
      from 0deg,
      ${(props) => props.$color} ${(props) => props.$progress * 100}%,
      transparent ${(props) => props.$progress * 100}%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    transition: background 0.3s ease;
  }
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 16px;
  font-family: var(--font-inter), sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  span.mime {
    background: #fff;
    color: #fff;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  span.flow {
    font-family: var(--font-dancing), cursive;
    font-weight: 400;
    margin-left: 8px;
    color: #fff;
  }
`;

const Subtitle = styled.p`
  color: #a1a1aa;
  margin-bottom: 40px;
  font-size: 1.2rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;

const Input = styled.input`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #4285f4;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }

  &::placeholder {
    color: #52525b;
  }
`;

const Button = styled.button`
  padding: 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(66, 133, 244, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FeedbackText = styled.p<{ $color: string }>`
  margin-top: 24px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  font-family: "Courier New", Courier, monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  min-height: 1.5em; /* Prevent layout shift */
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Cursor = styled.span`
  display: inline-block;
  margin-left: 2px;
  animation: blink 1s step-end infinite;

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const UploadContainer = styled.div`
  width: 100%;
  height: 220px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 30px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(66, 133, 244, 0.5);
    transform: scale(1.01);
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
  }

  p {
    color: #aaa;
    font-size: 0.9rem;
  }
`;

const UploadIcon = styled.div`
  color: #4285f4;
  margin-bottom: 16px;
  opacity: 0.9;
`;

const HiddenInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const SecondarySection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  span {
    padding: 0 12px;
  }
`;

const SmallButton = styled(Button)`
  padding: 12px 24px;
  font-size: 16px;
  width: auto;
  align-self: flex-end;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;
