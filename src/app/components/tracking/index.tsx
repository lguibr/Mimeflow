"use client";

import "@tensorflow/tfjs-backend-webgl";

import styled from "styled-components";
import dynamic from "next/dynamic";
import { useFile } from "@/app/contexts/File";
import { useRouter } from "next/navigation";
import FloatingWindow from "@/app/components/tracking/FloatingWindow";
import usePercentageToPixels from "@/app/hooks/usePercentageToPixels";
import ScoreGraphs from "./DisplayScore";
import { useGameViews } from "@/app/contexts/Game";
import { useSettings } from "@/app/contexts/Settings";
import VideoPoseTracking from "@/app/components/tracking/LocalVideoPoseTracking";

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
  const getPixels = usePercentageToPixels();
  const { loaded } = useGameViews();
  const { file } = useFile();
  const { push } = useRouter();
  const [x0, y0] = getPixels(0, 0);
  const [x100, y100] = getPixels(100, 100);
  const [x30, y30] = getPixels(30, 30);

  const {
    scorePreview,
    videoPreview3D: videoposePreview3D,
    webcamPreview3D: webposePreview3D,
    webcamPreview,
  } = useSettings();

  if (!file) {
    push("/");
    return null;
  }

  return (
    <Container>
      {loaded && window !== null && (
        <>
          {/* Video on full background */}
          <LocalVideoPoseTracking />
          {/* Video Pose 3d */}

          {videoposePreview3D && (
            <FloatingWindow
              x={x100}
              y={y100}
              width={x30 > y30 ? y30 : x30}
              height={x30 > y30 ? y30 : x30}
            >
              <Pose3DViewer type="video" />
            </FloatingWindow>
          )}

          {/* Webcam Video */}
          {webcamPreview && (
            <FloatingWindow
              x={x0}
              y={y0}
              width={x30 > y30 ? y30 : x30}
              height={x30 > y30 ? y30 : x30}
            >
              <WebcamPoseTracking />
            </FloatingWindow>
          )}

          {/* Webcam Pose 3d */}
          {webposePreview3D && (
            <FloatingWindow
              x={x100}
              y={y0}
              width={x30 > y30 ? y30 : x30}
              height={x30 > y30 ? y30 : x30}
            >
              {<Pose3DViewer type="webcam" />}
            </FloatingWindow>
          )}

          {/* Similarity Score */}
          {scorePreview && (
            <FloatingWindow
              x={x0}
              y={y100}
              width={x30 > y30 ? y30 : x30}
              height={x30 > y30 ? y30 : x30}
            >
              <ScoreGraphs />
            </FloatingWindow>
          )}
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
