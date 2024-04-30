"use client";
import styled, { createGlobalStyle } from "styled-components";
import StyledComponentsRegistry from "./lib/registry";

import { FileProvider } from "@/app/contexts/File";
import { GameProvider } from "@/app/contexts/Game";
import { SettingsProvider } from "./contexts/Settings";
import AppBar from "./components/core/AppBar";
import Background from "./components/core/Background";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
  }
  html {
    font-size: 62.5%; /* equivalent to 10px; 1rem = 10px; 10px/16px */
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
  }
  body {
    box-sizing: border-box;
    font-family: 'Muli', sans-serif;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
  }
`;

  return (
    <html>
      <body>
        <SettingsProvider>
          <GlobalStyles />
          <GameProvider>
            <StyledComponentsRegistry>
              <FileProvider>
                <Container>
                  <Background />
                  <AppBar />
                  {children}
                </Container>
              </FileProvider>
            </StyledComponentsRegistry>
          </GameProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

const Container = styled.div``;
