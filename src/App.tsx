import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/app/contexts/Settings";
import CoreProvider from "@/app/components/core/CoreProvider";
import ErrorBoundary from "@/app/components/core/ErrorBoundary";

import Home from "@/pages/Home";
import TrackingPage from "@/pages/Tracking";
import ScorePage from "@/pages/Score";

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
    font-family: 'Inter', sans-serif;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background: #0a0a0a;
    color: #ffffff;
  }
`;

const Container = styled.div``;

function App() {
  return (
    <Router>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <SettingsProvider>
          <GlobalStyles />
          <CoreProvider>
            <Container>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/score" element={<ScorePage />} />
              </Routes>
              <Toaster />
            </Container>
          </CoreProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
