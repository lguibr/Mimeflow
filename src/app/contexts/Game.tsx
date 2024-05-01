"use client";
import "@mediapipe/pose";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";

import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as mpPose from "@mediapipe/pose";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import { PoseDetector } from "@tensorflow-models/pose-detection";

import {
  IKeypoint3D,
  cosineSimilarity,
  sigmoidTransformAdjusted,
} from "../utils/calculations";

interface GameState {
  similarity: number;
  score: number;
  isPaused: boolean;
  videoNet: PoseDetector | null;
  webcamNet: PoseDetector | null;
  loaded: boolean;
  webcamPoints3d: IKeypoint3D[];
  videoPoints3d: IKeypoint3D[];
  history: number[];
}

interface GameActions {
  togglePause: () => void;
  setWebcamPoses: React.Dispatch<React.SetStateAction<poseDetection.Pose[]>>;
  setVideoPoses: React.Dispatch<React.SetStateAction<poseDetection.Pose[]>>;
  setHistory: React.Dispatch<React.SetStateAction<number[]>>;
}

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameActionsContext = createContext<GameActions | undefined>(undefined);

const GameProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const videoNetRef = useRef<poseDetection.PoseDetector | null>(null);
  const webcamNetRef = useRef<poseDetection.PoseDetector | null>(null);

  const [similarity, setSimilarityState] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [webcamPoses, setWebcamPoses] = useState<poseDetection.Pose[]>([]);
  const [videoPoses, setVideoPoses] = useState<poseDetection.Pose[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);

  const [webcamPose] = webcamPoses;
  const [videoPose] = videoPoses;
  const webcamPoints3d = useMemo(
    () => webcamPose?.keypoints3D || [],
    [webcamPose?.keypoints3D]
  );
  const videoPoints3d = useMemo(
    () => videoPose?.keypoints3D || [],
    [videoPose?.keypoints3D]
  );

  useEffect(() => {
    if (webcamPoints3d.length > 0 && videoPoints3d.length > 0) {
      if (!isPaused) {
        const similarity = cosineSimilarity(
          webcamPoints3d,
          videoPoints3d,
          "current"
        );
        const sigmoidedSimilarity = sigmoidTransformAdjusted(
          similarity,
          5,
          0.7
        );
        setSimilarityState(sigmoidedSimilarity);
      }
    }
  }, [isPaused, videoPoints3d, webcamPoints3d]);

  useEffect(() => {
    if (!isPaused) {
      setScore((prevScore) => prevScore + similarity);
    }
  }, [similarity, isPaused]);

  useEffect(() => {
    const loadPoseNet = async () => {
      await tfjsWasm.setWasmPaths(
        `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
      );

      await tf.ready();

      const detectorConfig: poseDetection.BlazePoseMediaPipeModelConfig = {
        runtime: "mediapipe",
        modelType: "lite",

        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
      };

      const video = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        detectorConfig
      );
      const webcam: poseDetection.PoseDetector =
        await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          detectorConfig
        );
      videoNetRef.current = video;
      webcamNetRef.current = webcam;
      setLoaded(true);
    };

    if (!videoNetRef.current && !webcamNetRef.current) loadPoseNet();
  }, []);

  useEffect(() => {
    !isPaused && setHistory((prev) => [...prev, score]);
  }, [isPaused, score]);

  const togglePause = useCallback(() => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  }, []);

  const actions = useMemo(
    () => ({
      togglePause,
      setWebcamPoses,
      setVideoPoses,
      setHistory,
    }),
    [togglePause, setWebcamPoses, setVideoPoses]
  );

  const state = useMemo(
    () => ({
      similarity,
      score,
      isPaused,
      videoNet: videoNetRef.current,
      webcamNet: webcamNetRef.current,
      loaded,
      webcamPoints3d,
      videoPoints3d,
      history,
    }),
    [
      similarity,
      score,
      isPaused,
      loaded,
      webcamPoints3d,
      videoPoints3d,
      history,
    ]
  );

  return (
    <GameActionsContext.Provider value={actions}>
      <GameStateContext.Provider value={state}>
        {children}
      </GameStateContext.Provider>
    </GameActionsContext.Provider>
  );
};

const useGameActions = () => {
  const context = useContext(GameActionsContext);
  if (!context) {
    throw new Error("useGameActions must be used within a GameProvider");
  }
  return context;
};

const useGameViews = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameViews must be used within a GameProvider");
  }
  return context;
};

export { GameProvider, useGameActions, useGameViews };
