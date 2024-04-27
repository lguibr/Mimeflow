"use client";
import { createGlobalStyle } from "styled-components";
import StyledComponentsRegistry from "./lib/registry";
import dynamic from "next/dynamic";

import { FileProvider } from "@/app/contexts/File"; // Assuming FileContext is in FileContext.tsx

const Background = dynamic(() => import("@/app/components/Background"), {
  ssr: false,
});

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
    background-color: black;
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
        <GlobalStyles />
        <StyledComponentsRegistry>
          <Background />
          <FileProvider>{children}</FileProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
