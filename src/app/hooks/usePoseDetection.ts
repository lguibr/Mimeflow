import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs-core";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as mpPose from "@mediapipe/pose";
import { PoseDetector } from "@tensorflow-models/pose-detection";

export function usePoseDetection() {
  const [videoNet, setVideoNet] = useState<PoseDetector | undefined>(undefined);
  const [webcamNet, setWebcamNet] = useState<PoseDetector | undefined>(
    undefined
  );

  useEffect(() => {
    const loadPoseNet = async () => {
      await tfjsWasm.setWasmPaths(
        `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
      );
      await tf.ready();

      const options: poseDetection.ModelConfig = {
        runtime: "mediapipe",
        modelType: "heavy",
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
      };

      const video = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        options
      );
      const webcam = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        options
      );

      setVideoNet(video);
      setWebcamNet(webcam);
    };

    if (!videoNet && !webcamNet) {
      loadPoseNet();
    }
  }, [videoNet, webcamNet]);

  return { videoNet, webcamNet };
}
