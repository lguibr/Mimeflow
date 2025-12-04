import React from "react";
import { Button } from "@/components/ui/button";
import ScoreGraph from "./ScoreGraph";
import { Trophy, RefreshCw, Home } from "lucide-react";

interface ResultScreenProps {
  score: number;
  onPlayAgain: () => void;
  onTryAnother: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  onPlayAgain,
  onTryAnother,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl p-8 mx-4 relative">
        {/* Glassmorphic Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-12 flex flex-col items-center text-center">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="mb-8 relative z-10">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <Trophy className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
            </div>
            <h2 className="text-5xl font-black text-white mb-2 tracking-tight">
              Game Over!
            </h2>
            <p className="text-xl text-white/60 font-medium">
              Great effort! Here is your performance summary.
            </p>
          </div>

          {/* Score Display */}
          <div className="mb-12 relative z-10">
            <div className="text-9xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              {Math.round(score)}
            </div>
            <div className="text-2xl font-bold text-white/40 uppercase tracking-widest mt-2">
              Total Points
            </div>
          </div>

          {/* Graph Section */}
          <div className="w-full h-64 mb-12 rounded-2xl border border-white/5 bg-black/20 p-6 relative z-10">
            <ScoreGraph />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg relative z-10">
            <Button
              variant="outline"
              className="flex-1 h-16 text-lg font-semibold rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
              onClick={onTryAnother}
            >
              <Home className="mr-3 h-6 w-6" />
              Back Home
            </Button>
            <Button
              className="flex-1 h-16 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 transition-all border-0"
              onClick={onPlayAgain}
            >
              <RefreshCw className="mr-3 h-6 w-6" />
              Play Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
