import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, signInAnonymously } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// ⚠️ CONFIGURATION: From your Low-Score Project Console
const leaderboardConfig = {
  apiKey: import.meta.env.VITE_LEADERBOARD_API_KEY,
  authDomain: import.meta.env.VITE_LEADERBOARD_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_LEADERBOARD_PROJECT_ID,
  storageBucket: import.meta.env.VITE_LEADERBOARD_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_LEADERBOARD_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_LEADERBOARD_APP_ID,
};

// Initialize SECONDARY App
const lbApp = initializeApp(leaderboardConfig, "LeaderboardService");

// Enable Localhost Debugging
if (typeof window !== "undefined" && location.hostname === "localhost") {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

initializeAppCheck(lbApp, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

const lbAuth = getAuth(lbApp);
const lbFunctions = getFunctions(lbApp, "us-central1");

async function initLeaderboard() {
  if (!lbAuth.currentUser) {
    try {
      await signInAnonymously(lbAuth);
    } catch (e) {
      console.warn("Leaderboard Login Failed (Likely invalid config):", e);
    }
  }
}

// ... types
export interface ScoreEntry {
  displayName: string;
  score: number;
  [key: string]: any;
}

export async function sendHighScore(
  gameId: string,
  playerName: string,
  score: number,
  metadata = {}
) {
  await initLeaderboard();

  // If auth failed, we can't submit
  if (!lbAuth.currentUser) {
    console.warn(
      "Skipping highscore submission: Not authenticated to Leaderboard Service."
    );
    return;
  }

  // Truncate name to fit backend limits (e.g. 20 chars)
  const safeName = playerName.substring(0, 15);

  const submit = httpsCallable(lbFunctions, "submitScore");
  try {
    const result = await submit({
      appId: gameId,
      score: score,
      displayName: safeName,
      tags: metadata,
    });
    console.log("🏆 Score submitted:", result.data);
  } catch (err) {
    console.error("❌ Submission failed:", err);
  }
}

export async function getLeaderboard(
  gameId: string,
  limit = 10,
  metadata = {}
): Promise<ScoreEntry[]> {
  await initLeaderboard();
  const getLb = httpsCallable(lbFunctions, "getLeaderboard");
  try {
    const result = await getLb({
      appId: gameId,
      limit,
      tags: metadata,
    });
    return result.data as ScoreEntry[];
  } catch (err) {
    console.error("❌ Failed to fetch leaderboard:", err);
    return [];
  }
}
