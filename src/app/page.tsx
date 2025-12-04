"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Logo from "./components/core/Logo";
import dynamic from "next/dynamic";
import { FolderOpen } from "lucide-react";

const WebcamPoseTracking = dynamic(
  () => import("./components/tracking/WebcamPoseTracking"),
  { ssr: false }
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/tracking?youtubeUrl=${encodeURIComponent(url)}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      router.push(
        `/tracking?videoUrl=${encodeURIComponent(
          videoUrl
        )}&videoId=${encodeURIComponent(file.name)}`
      );
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
        </Title>
        <Subtitle>
          Upload a video or paste a YouTube link (under 1 min) to start matching
          poses.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Paste YouTube Shorts URL, Video Link, or Video ID"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit">Start Tracking</Button>
        </Form>

        <UploadSection htmlFor="video-upload">
          <input
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <FolderOpen size={48} color="#ffffff" opacity={0.8} />
          <UploadText>Click to upload a video</UploadText>
          <UploadSubtext>MP4, WebM or MOV</UploadSubtext>
        </UploadSection>

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
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 18px;
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

const UploadSection = styled.label`
  margin-top: 40px;
  padding: 40px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: #a1a1aa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;

  &:hover {
    border-color: #4285f4;
    background: rgba(66, 133, 244, 0.05);
    color: #e4e4e7;
  }
`;

const UploadText = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
  color: #ffffff;
`;

const UploadSubtext = styled.p`
  margin-top: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
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
