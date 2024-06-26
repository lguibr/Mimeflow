"use client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

import styled, { createGlobalStyle } from "styled-components";
import StyledComponentsRegistry from "./lib/registry";

import { SettingsProvider } from "./contexts/Settings";
import AppBar from "./components/core/AppBar";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/app/components/core/ErrorBoundary.jsx";
import { useEffect } from "react";
const Background = dynamic(() => import("@/app/components/core/Background"), {
  ssr: false,
});
const CoreProvider = dynamic(
  () => import("@/app/components/core/CoreProvider"),
  {
    ssr: false,
  }
);
const WebcamPoseTracking = dynamic(
  () => import("@/app/components/tracking/WebcamPoseTracking"),
  {
    ssr: false,
  }
);

const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    font-size: 62.5%; /* equivalent to 10px; 1rem = 10px; 10px/16px */
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    background:#000626ff;
  }
  body {
    box-sizing: border-box;
    font-family: 'Muli', sans-serif;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let sw: ServiceWorkerContainer | undefined;

  if (typeof window !== "undefined") {
    sw = window?.navigator?.serviceWorker;
  }
  useEffect(() => {
    if (sw) {
      sw.register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log(
            "Service Worker registration successful with scope: ",
            registration.scope
          );
        })
        .catch((err) => {
          console.log("Service Worker registration failed: ", err);
        });
    }
  }, [sw]);

  return (
    <html>
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
                  <Background />
                  <AppBar />
                  <WebcamPoseTracking />
                  <SpeedInsights />
                  <Analytics />
                  {children}
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
