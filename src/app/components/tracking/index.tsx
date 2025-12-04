"use client";

import styled from "styled-components";
import dynamic from "next/dynamic";

import ScoreGraphs from "@/app/components/tracking/DisplayScore";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import { useFile } from "@/app/contexts/File";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

const Pose3DViewer = dynamic(
  () => import("@/app/components/tracking/Pose3DViewer"),
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

const LocalVideoPoseTracking = dynamic(
  () => import("@/app/components/tracking/LocalVideoPoseTracking"),
  {
    ssr: false,
  }
);

const YoutubePoseTracking = dynamic(
  () => import("@/app/components/tracking/YoutubePoseTracking"),
  {
    ssr: false,
  }
);

const App: React.FC = () => {
  const { setVideoPoses, setWebcamPoses } = useGameActions();
  const { loaded } = useGameViews();
  const { file } = useFile();
  const { push } = useRouter();

  const resetTracking = useCallback(() => {
    setVideoPoses(null);
    setWebcamPoses(null);
  }, [setVideoPoses, setWebcamPoses]);

  useEffect(() => {
    // if (!file) push("/");
    return () => resetTracking();
  }, [file, push, resetTracking]);

  if (window === null) return null;
  return (
    <Container>
      {loaded && (
        <>
          {/* <LocalVideoPoseTracking /> */}
          <YoutubePoseTracking />
          <Pose3DViewer type="webcam" />
          <Pose3DViewer type="video" />
          <ScoreGraphs />
        </>
      )}
    </Container>
  );
};

export default App;

const Container = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
`;
