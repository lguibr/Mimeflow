"use client";

import dynamic from "next/dynamic";
import Grid from "@/app/components/core/Grid";
const ScoreView = dynamic(() => import("@/app/components/score"), {
  ssr: false,
});

const ScorePaGe: React.FC = () => {
  return (
    <main>
      <Grid gridSpan={{ xs: [1, 13], sm: [1, 13], md: [3, 11], lg: [4, 10] }}>
        <ScoreView />
      </Grid>
    </main>
  );
};

export default ScorePaGe;
