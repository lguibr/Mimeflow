"use client";
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

import {
  PoseLandmarker,
  FilesetResolver,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import {
  IKeypoint3D,
  cosineSimilarity,
  sigmoidTransformAdjusted,
  mirrorLandmarks,
} from "../utils/calculations";
import { db } from "../db/db";

interface GameState {
  similarity: number;
  score: number;
  isPaused: boolean;
  videoNet: PoseLandmarker | null;
  webcamNet: PoseLandmarker | null;
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
  setWebcamPoses: React.Dispatch<
    React.SetStateAction<PoseLandmarkerResult | null>
  >;
  setVideoPoses: React.Dispatch<
    React.SetStateAction<PoseLandmarkerResult | null>
  >;
  setHistory: React.Dispatch<React.SetStateAction<number[]>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setFps: React.Dispatch<React.SetStateAction<number | undefined>>;
  setActiveSampleSpace: React.Dispatch<React.SetStateAction<number>>;
  saveScore: (videoId: string) => Promise<void>;
}

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameActionsContext = createContext<GameActions | undefined>(undefined);

const GameProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const videoNetRef = useRef<PoseLandmarker | null>(null);
  const webcamNetRef = useRef<PoseLandmarker | null>(null);

  const [activeSampleSpace, setActiveSampleSpace] = useState<number>(1); // 1 is 100% 2 is 50% 3 is 33% ... 100/x%
  const [similarity, setSimilarityState] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [webcamPoses, setWebcamPoses] = useState<PoseLandmarkerResult | null>(
    null
  );
  const [videoPoses, _setVideoPoses] = useState<PoseLandmarkerResult | null>(
    null
  );

  const setVideoPoses = useCallback(
    (value: React.SetStateAction<PoseLandmarkerResult | null>) => {
      _setVideoPoses(value);
    },
    []
  );

  const [loaded, setLoaded] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);
  const [backend] = useState<string | undefined>("mediapipe-tasks");
  const [fps, setFps] = useState<number | undefined>();

  // Extract 3D keypoints from the first detected pose
  const webcamPoints3d = useMemo(() => {
    if (
      webcamPoses &&
      webcamPoses.worldLandmarks &&
      webcamPoses.worldLandmarks.length > 0
    ) {
      return webcamPoses.worldLandmarks[0] as unknown as IKeypoint3D[];
    }
    return [];
  }, [webcamPoses]);

  const videoPoints3d = useMemo(() => {
    if (
      videoPoses &&
      videoPoses.worldLandmarks &&
      videoPoses.worldLandmarks.length > 0
    ) {
      return videoPoses.worldLandmarks[0] as unknown as IKeypoint3D[];
    }
    return [];
  }, [videoPoses]);

  const videoPointsBuffer = useRef<IKeypoint3D[][]>([]);
  const webcamPointsBuffer = useRef<IKeypoint3D[][]>([]);
  const evaluationFrameCount = useRef(0);

  useEffect(() => {
    if (webcamPoints3d.length > 0 && videoPoints3d.length > 0) {
      if (!isPaused) {
        // 1. Maintain Buffers (Double Buffering)
        // Store last ~20 frames for BOTH video and webcam to allow full temporal flexibility
        if (videoPoints3d.length > 0) {
          videoPointsBuffer.current.push(videoPoints3d);
          if (videoPointsBuffer.current.length > 20) {
            // Keep last ~20 frames (approx 330ms at 60fps)
            videoPointsBuffer.current.shift();
          }
        }

        // Mirror the webcam points first to match data format
        const mirroredWebcamPoints = mirrorLandmarks(webcamPoints3d);
        if (mirroredWebcamPoints.length > 0) {
          webcamPointsBuffer.current.push(mirroredWebcamPoints);
          if (webcamPointsBuffer.current.length > 20) {
            webcamPointsBuffer.current.shift();
          }
        }

        // 2. Throttle Evaluation (1/3 of frames)
        evaluationFrameCount.current += 1;
        if (evaluationFrameCount.current % 3 !== 0) {
          return;
        }

        // 3. Double Buffer Matching (Matrix Comparison)
        // Compare EVERY recorded webcam frame against EVERY recorded video frame in the buffer window.
        // This finds the "best possible match" that happened recently, regardless of if the user
        // was early, late, or right on time.
        let maxSimilarity = 0;

        const videoCandidates =
          videoPointsBuffer.current.length > 0
            ? videoPointsBuffer.current
            : [videoPoints3d];

        const webcamCandidates =
          webcamPointsBuffer.current.length > 0
            ? webcamPointsBuffer.current
            : [mirroredWebcamPoints];

        for (const videoFrame of videoCandidates) {
          for (const webcamFrame of webcamCandidates) {
            const sim = cosineSimilarity(webcamFrame, videoFrame);
            if (sim > maxSimilarity) {
              maxSimilarity = sim;
            }
          }
        }

        const rawSimilarity = maxSimilarity;
        const sigmoidedSimilarity = sigmoidTransformAdjusted(
          rawSimilarity,
          5,
          0.7
        );

        setSimilarityState(sigmoidedSimilarity);

        const percentage = Math.round(sigmoidedSimilarity * 100);

        // Calculate new history and average score based on current history ref
        const currentHistory = historyRef.current;
        const newHistory = [...currentHistory, percentage];

        const sum = newHistory.reduce((a, b) => a + b, 0);
        const average = sum / newHistory.length;

        setHistory(newHistory);
        setScore(average);
      }
    }
  }, [isPaused, videoPoints3d, webcamPoints3d]);

  useEffect(() => {
    const loadPoseNet = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      const poseLandmarkerOptions = {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
          delegate: "GPU" as const,
        },
        runningMode: "VIDEO" as const,
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };

      const video = await PoseLandmarker.createFromOptions(
        vision,
        poseLandmarkerOptions
      );
      const webcam = await PoseLandmarker.createFromOptions(
        vision,
        poseLandmarkerOptions
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

  const scoreRef = useRef(score);
  const similarityRef = useRef(similarity);
  const historyRef = useRef(history);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    similarityRef.current = similarity;
  }, [similarity]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const togglePause = useCallback((value?: boolean) => {
    setIsPaused((prevIsPaused) =>
      value !== undefined ? value : !prevIsPaused
    );
  }, []);

  const saveScore = useCallback(async (videoId: string) => {
    try {
      const currentScore = scoreRef.current;
      const currentHistory = historyRef.current;

      // Score is now the average percentage, so we use it directly
      await db.scores.add({
        videoId,
        score: Math.round(currentScore),
        percentage: Math.round(currentScore), // Final percentage is the same as average score
        date: new Date(),
        history: [...currentHistory],
      });
    } catch (error) {
      console.error("Failed to save score:", error);
    }
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
      saveScore,
    }),
    [togglePause, saveScore]
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
