"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Logo from "./components/core/Logo";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/tracking?youtubeUrl=${encodeURIComponent(url)}`);
    }
  };

  return (
    <Container>
      <Card>
        <Title>
          <Logo width="300px" height="150px" />
        </Title>
        <Subtitle>
          Upload a video or paste a YouTube Shorts link (max 1 min) to start
          matching poses.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Paste YouTube Shorts URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit">Start Tracking</Button>
        </Form>

        {/* Placeholder for file upload */}
        <UploadSection>
          <p>Or upload a video file</p>
          <UploadButton disabled>Upload Video (Coming Soon)</UploadButton>
        </UploadSection>
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
`;

const Card = styled.div`
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 60px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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

const UploadSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #71717a;
`;

const UploadButton = styled.button`
  margin-top: 15px;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px dashed #52525b;
  background: transparent;
  color: #71717a;
  cursor: not-allowed;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: #71717a;
    color: #a1a1aa;
  }
`;
