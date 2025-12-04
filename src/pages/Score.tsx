import React from "react";
import Grid from "@/app/components/core/Grid";
import ScoreView from "@/app/components/score";

const ScorePage: React.FC = () => {
  return (
    <main>
      <Grid gridSpan={{ xs: [1, 13], sm: [1, 13], md: [3, 11], lg: [4, 10] }}>
        <ScoreView />
      </Grid>
    </main>
  );
};

export default ScorePage;
