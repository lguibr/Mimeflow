"use client";

import "@tensorflow/tfjs-backend-webgl";

import styled from "styled-components";
import dynamic from "next/dynamic";

import ScoreGraphs from "@/app/components/tracking/DisplayScore";
import { useGameViews } from "@/app/contexts/Game";
import { useFile } from "@/app/contexts/File";
import { useRouter } from "next/navigation";

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

const App: React.FC = () => {
  const { loaded } = useGameViews();
  const { file } = useFile();
  const { push } = useRouter();

  if (!file) {
    push("/");
    return null;
  }

  return (
    <Container>
      {loaded && window !== null && (
        <>
          <LocalVideoPoseTracking />
          <Pose3DViewer type="webcam" />
          <Pose3DViewer type="video" />
          <WebcamPoseTracking />
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
