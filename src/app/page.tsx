"use client";

import "@tensorflow/tfjs-backend-webgl";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import * as mpPose from "@mediapipe/pose";
import dynamic from "next/dynamic";

const WebcamPoseTracking = dynamic(
  () => import("@/app/components/WebcamPoseTracking"),
  {
    ssr: false,
  }
);
const LocalVideoPoseTracking = dynamic(
  () => import("@/app/components/LocalVideoPoseTracking"),
  {
    ssr: false,
  }
);
const App: React.FC = () => {
  const [webcamPose, setWebcamPose] = useState<poseDetection.Pose[]>([]);
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

  const [videoNet, setVideoNet] = useState<
    poseDetection.PoseDetector | undefined
  >(undefined);

  const [webcamNet, setWebcamNet] = useState<
    poseDetection.PoseDetector | undefined
  >(undefined);

  useEffect(() => {
    if (!videoNet && !webcamNet) {
      loadPoseNet();
    }
  }, []);

  return (
    <main>
      <Container>
        {videoNet && webcamNet && window !== null && (
          <>
            <LocalVideoPoseTracking net={videoNet} />
            <WebcamPoseTracking
              poses={webcamPose}
              setPose={setWebcamPose}
              net={webcamNet}
            />
          </>
        )}
      </Container>
    </main>
  );
};

export default App;

const Container = styled.div`
  border: 10px dotted green;
  display: grid;
  grid-template-rows: 70%% 30%;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
`;
