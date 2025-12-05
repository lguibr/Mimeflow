import React from "react";
import { Button } from "@/components/ui/button";
import ScoreGraph from "./ScoreGraph";
import { Trophy, RefreshCw, Home, Crown } from "lucide-react";
import { useAuth } from "@/app/contexts/Auth";
import {
  sendHighScore,
  getLeaderboard,
  ScoreEntry,
} from "@/app/services/leaderboard";

interface ResultScreenProps {
  score: number;
  levelId?: string;
  onPlayAgain: () => void;
  onTryAnother: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  levelId,
  onPlayAgain,
  onTryAnother,
}) => {
  /* Auth & Leaderboard Integration */
  const { user, login } = useAuth();
  const [submitted, setSubmitted] = React.useState(false);
  const [leaderboard, setLeaderboard] = React.useState<ScoreEntry[]>([]);
  const [isTopScore, setIsTopScore] = React.useState(false);

  // Fetch Leaderboard
  React.useEffect(() => {
    if (levelId) {
      getLeaderboard("mimeflow-v1", 10, { levelId }).then((data) => {
        setLeaderboard(data);
        // Check if current score is high enough to be on the board
        const qualifies = data.length < 10 || data.some((e) => score > e.score);
        if (qualifies && score > 0) {
          setIsTopScore(true);
        }
      });
    }
  }, [levelId, score]);

  React.useEffect(() => {
    if (user && !submitted && score > 0) {
      // Automatic submission
      const submit = async () => {
        try {
          await sendHighScore(
            "mimeflow-v1",
            user.displayName || "Anonymous",
            score,
            {
              uid: user.uid,
              // Renaming to clientTimestamp to avoid collision with backend serverTimestamp
              clientTimestamp: new Date().toISOString(),
              levelId: levelId || "unknown",
            }
          );
          setSubmitted(true);
          // Refresh leaderboard after submission
          if (levelId) {
            setTimeout(() => {
              getLeaderboard("mimeflow-v1", 10, { levelId }).then(
                setLeaderboard
              );
            }, 2000);
          }
        } catch (e) {
          console.error("Auto-submission failed", e);
        }
      };
      submit();
    }
  }, [user, submitted, score, levelId]);

  const handleLoginAndSave = async () => {
    await login();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto py-10">
      <div className="w-full max-w-5xl p-4 md:p-8 mx-auto relative flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN: Current Score */}
        <div className="flex-1 relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl p-8 flex flex-col items-center text-center">
          {/* Background Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="mb-6 relative z-10 w-full">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              {isTopScore ? (
                <Crown className="h-10 w-10 text-yellow-400 drop-shadow-lg animate-bounce" />
              ) : (
                <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-lg" />
              )}
            </div>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
              {isTopScore
                ? leaderboard.length > 0 && score > leaderboard[0].score
                  ? "New World Record!"
                  : "Top 10 Score!"
                : "Game Over"}
            </h2>
            <p className="text-lg text-white/60 font-medium">
              {isTopScore ? "You made the Leaderboard!" : "Performance Summary"}
            </p>
          </div>

          {/* Score Info */}
          <div className="mb-8 relative z-10">
            <div className="text-8xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              {Math.round(score)}
            </div>
            <div className="text-xl font-bold text-white/40 uppercase tracking-widest mt-1">
              Total Points
            </div>
          </div>

          {/* Chart */}
          <div className="w-full h-48 mb-8 rounded-2xl border border-white/5 bg-black/20 p-4 relative z-10">
            <ScoreGraph />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 w-full relative z-10 mt-auto">
            {!user ? (
              <Button
                variant="outline"
                className="w-full h-14 text-md font-semibold rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:text-white transition-all"
                onClick={handleLoginAndSave}
              >
                Login to Save Highscore
              </Button>
            ) : (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                Logged in as {user?.displayName} {submitted && "✅ Submitted"}
              </div>
            )}

            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1 h-12 text-md font-semibold rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={onTryAnother}
              >
                <Home className="mr-2 h-5 w-5" />
                Home
              </Button>
              <Button
                className="flex-1 h-12 text-md font-bold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-0"
                onClick={onPlayAgain}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Replay
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Leaderboard */}
        <div className="w-full md:w-96 relative overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Crown className="text-yellow-500 h-6 w-6" />
            <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {leaderboard.length === 0 ? (
              <div className="text-center text-white/40 py-10">
                No scores yet. <br /> Be the first!
              </div>
            ) : (
              leaderboard.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-3 rounded-xl border ${
                    idx === 0
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-white/5 border-white/5"
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${
                      idx === 0
                        ? "bg-yellow-500 text-black"
                        : idx === 1
                        ? "bg-gray-300 text-black"
                        : idx === 2
                        ? "bg-amber-700 text-white"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {entry.displayName}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(entry.timestamp || 0).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xl font-black text-blue-400">
                    {Math.round(entry.score)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
