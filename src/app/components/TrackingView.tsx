"use client";

import "@tensorflow/tfjs-backend-webgl";

import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import * as mpPose from "@mediapipe/pose";
import dynamic from "next/dynamic";
import { useFile } from "../contexts/File";
import { useRouter } from "next/navigation";

const Pose3DViewer = dynamic(() => import("@/app/components/Pose3DViewer"), {
  ssr: false,
});
const WebcamPoseTracking = dynamic(
  () => import("@/app/components/WebcamPoseTracking"),
  {
    ssr: false,
  }
);
const Similarity = dynamic(() => import("@/app/components/Similarity"), {
  ssr: false,
});
const LocalVideoPoseTracking = dynamic(
  () => import("@/app/components/LocalVideoPoseTracking"),
  {
    ssr: false,
  }
);

const App: React.FC = () => {
  const [webcamPoses, setWebcamPoses] = useState<poseDetection.Pose[]>([]);

  const [videoPoses, setVideoPoses] = useState<poseDetection.Pose[]>([]);
  const [webcamPose] = webcamPoses;
  const [videoPose] = videoPoses;
  const webcamPoints3d = webcamPose?.keypoints3D || [];
  const videoPoints3d = videoPose?.keypoints3D || [];

  const [videoNet, setVideoNet] = useState<
    poseDetection.PoseDetector | undefined
  >(undefined);

  const [webcamNet, setWebcamNet] = useState<
    poseDetection.PoseDetector | undefined
  >(undefined);

  useEffect(() => {
    const loadPoseNet = async () => {
      await tfjsWasm.setWasmPaths(
        `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
      );

      await tf.ready();

      const video: poseDetection.PoseDetector =
        await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          {
            runtime: "mediapipe",
            modelType: "heavy",
            solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
          }
        );
      const webcam: poseDetection.PoseDetector =
        await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          {
            runtime: "mediapipe",
            modelType: "heavy",
            solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
          }
        );
      setVideoNet(video);
      setWebcamNet(webcam);
    };

    if (!videoNet && !webcamNet) {
      loadPoseNet();
    }
  }, [videoNet, webcamNet]);
  const { file } = useFile();
  const { push } = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };
  const onEnd = useCallback(() => setIsPlaying(false), []);
  if (!file) {
    push("/");
    return null;
  }
  return (
    <Container>
      {videoNet && webcamNet && window !== null && (
        <>
          <Row>
            <Box>
              {!isPlaying && (
                <PlayButton onClick={handlePlayToggle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="black"
                    width="18px"
                    height="18px"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </PlayButton>
              )}
              {isPlaying && (
                <LocalVideoPoseTracking
                  isPlaying={isPlaying}
                  file={file}
                  net={videoNet}
                  setPoses={setVideoPoses}
                  onEnd={onEnd}
                />
              )}
            </Box>
            <div>
              <Pose3DViewer keypoints={videoPoints3d} />
            </div>
          </Row>
          <Row>
            <WebcamPoseTracking setPoses={setWebcamPoses} net={webcamNet} />
            <div>{<Pose3DViewer keypoints={webcamPoints3d} />}</div>
          </Row>
          <Row>
            {webcamPoints3d.length > 0 && videoPoints3d.length > 0 && (
              <Similarity poseOne={webcamPoints3d} poseTwo={videoPoints3d} />
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default App;

const Container = styled.div`
  display: grid;
  height: 100vh;
  width: 100vw;
  grid-template-rows: 3fr 1fr 350px;
  box-sizing: border-box;
`;

const Box = styled.div`
  height: 100%;
  width: 100%;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr min(50%, 400px);
  grid-auto-rows: 100%;
  width: 100vw;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  width: 100%;
  border: 8px dashed gold;
  box-sizing: border-box;
`;

const PlayButton = styled.div`
  position: relative;
  border: none;
  z-index: 999;
  width: 100%;
  height: 100%;
  border: 10px solid white;
  svg {
    cursor: pointer;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 999;
    width: 150px; // Adjust size as needed
    height: 150px;
    fill: white; // Or any color
  }
`;
