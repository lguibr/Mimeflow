"use client";

import dynamic from "next/dynamic";
import Grid from "@/app/components/core/Grid";
const ScoreView = dynamic(() => import("@/app/components/score"), {
  ssr: false,
});

const ScorePaGe: React.FC = () => {
  return (
    <main>
      <Grid gridSpan={{ xs: [1, 12], sm: [1, 12], md: [2, 11], lg: [3, 10] }}>
        <ScoreView />
      </Grid>
    </main>
  );
};

export default ScorePaGe;
