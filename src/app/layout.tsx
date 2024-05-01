"use client";

import styled, { createGlobalStyle } from "styled-components";
import StyledComponentsRegistry from "./lib/registry";

import { SettingsProvider } from "./contexts/Settings";
import AppBar from "./components/core/AppBar";

import dynamic from "next/dynamic";
const Background = dynamic(() => import("@/app/components/core/Background"), {
  ssr: false,
});
const CoreProvider = dynamic(
  () => import("@/app/components/core/CoreProvider"),
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
  return (
    <html>
      <head>
        <title>MimeFlow v0 - The Pose Matching Application</title>
      </head>
      <body>
        <StyledComponentsRegistry>
          <SettingsProvider>
            <GlobalStyles />
            <CoreProvider>
              <Container>
                <Background />
                <AppBar />
                {children}
              </Container>
            </CoreProvider>
          </SettingsProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

const Container = styled.div``;
