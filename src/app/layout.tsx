"use client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Inter, Dancing_Script } from "next/font/google";

import styled, { createGlobalStyle } from "styled-components";
import StyledComponentsRegistry from "./lib/registry";

import { SettingsProvider } from "./contexts/Settings";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/app/components/core/ErrorBoundary.jsx";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import CoreProvider from "./components/core/CoreProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    font-size: 62.5%; 
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    background: #0a0a0a;
  }
  body {
    box-sizing: border-box;
    font-family: var(--font-inter), sans-serif;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background: #0a0a0a;
    color: #ffffff;
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ... existing service worker logic ...

  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable}`}>
      <head>
        <title>MimeFlow 0.1 - The Pose Matching Application</title>
      </head>
      <body>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <StyledComponentsRegistry>
            <SettingsProvider>
              <GlobalStyles />
              <CoreProvider>
                <Container>
                  {/* <Background /> */}
                  {/* <WebcamPoseTracking /> */}
                  <SpeedInsights />
                  <Analytics />
                  {children}
                  <Toaster />
                </Container>
              </CoreProvider>
            </SettingsProvider>
          </StyledComponentsRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
}

const Container = styled.div``;
