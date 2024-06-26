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
  backend: string | undefined;
  fps?: number;
  activeSampleSpace: number;
}

interface GameActions {
  togglePause: (value?: boolean) => void;
  setWebcamPoses: React.Dispatch<React.SetStateAction<poseDetection.Pose[]>>;
  setVideoPoses: React.Dispatch<React.SetStateAction<poseDetection.Pose[]>>;
  setHistory: React.Dispatch<React.SetStateAction<number[]>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setFps: React.Dispatch<React.SetStateAction<number | undefined>>;
  setActiveSampleSpace: React.Dispatch<React.SetStateAction<number>>;
}

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameActionsContext = createContext<GameActions | undefined>(undefined);

const GameProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const videoNetRef = useRef<poseDetection.PoseDetector | null>(null);
  const webcamNetRef = useRef<poseDetection.PoseDetector | null>(null);

  const [activeSampleSpace, setActiveSampleSpace] = useState<number>(1); // 1 is 100% 2 is 50% 3 is 33% ... 100/x%
  const [similarity, setSimilarityState] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [webcamPoses, setWebcamPoses] = useState<poseDetection.Pose[]>([]);
  const [videoPoses, setVideoPoses] = useState<poseDetection.Pose[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);
  const [backend, setBackend] = useState<string | undefined>();
  const [fps, setFps] = useState<number | undefined>();
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
        const similarity = cosineSimilarity(webcamPoints3d, videoPoints3d);
        const sigmoidedSimilarity = sigmoidTransformAdjusted(
          similarity,
          5,
          0.7
        );
        !isPaused && setSimilarityState(sigmoidedSimilarity);
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
      const currentBackend = await tf.getBackend();
      setBackend(currentBackend);
      const is2k = () =>
        typeof window !== "undefined" && window.innerWidth >= 2560;

      const isDesktop = () =>
        typeof window !== "undefined" && window.innerWidth >= 1024;

      const detectorConfig: poseDetection.BlazePoseMediaPipeModelConfig = {
        runtime: "mediapipe",
        modelType: is2k() ? "heavy" : isDesktop() ? "full" : "lite",
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
      };

      const video = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        { ...detectorConfig }
      );
      const webcam: poseDetection.PoseDetector =
        await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          { ...detectorConfig }
        );
      videoNetRef.current = video;
      webcamNetRef.current = webcam;
      setLoaded(true);
    };
    const debounced = setTimeout(() => {
      if (!videoNetRef.current && !webcamNetRef.current && !loaded)
        loadPoseNet();
    }, 200);
    return () => clearTimeout(debounced);
  }, [loaded]);

  useEffect(() => {
    !isPaused && setHistory((prev) => [...prev, score]);
  }, [isPaused, score]);

  const togglePause = useCallback((value?: boolean) => {
    setIsPaused((prevIsPaused) => (value ? value : !prevIsPaused));
  }, []);

  const actions = useMemo(
    () => ({
      togglePause,
      setWebcamPoses,
      setVideoPoses,
      setHistory,
      setScore,
      setFps,
      setActiveSampleSpace,
    }),
    [togglePause]
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
      backend,
      fps,
      activeSampleSpace,
    }),
    [
      similarity,
      score,
      isPaused,
      loaded,
      webcamPoints3d,
      videoPoints3d,
      history,
      backend,
      fps,
      activeSampleSpace,
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
