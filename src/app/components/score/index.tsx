"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useGameActions, useGameViews } from "@/app/contexts/Game";
import { useFile } from "@/app/contexts/File";
import ScoreGraph from "@/app/components/score/ScoreGraph";
import Button from "@/app/components/core/Button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/app/services/dexie";
import ReplayIcon from "../core/Replay";
import { useEffect } from "react";
import HomeIcon from "../core/HomeIcon";
const ScoreView: React.FC = () => {
  const { push } = useRouter();
  const { setFile, hash } = useFile();
  const { score } = useGameViews();
  const { togglePause, setHistory, setScore } = useGameActions();
  const leaderBoard = useLiveQuery(() => db.leaderBoard.toArray());
  const scoreForCurrentHash = leaderBoard?.find((entry) => entry.hash === hash);

  const resetGame = () => {
    if (!scoreForCurrentHash || scoreForCurrentHash?.score < score) {
      db.leaderBoard.put({ hash, score });
    }
    setHistory([]);
    setScore(0);
    togglePause(true);
  };
  if (!score) {
    return null;
  }

  const restartGame = () => {
    resetGame();
    push("/tracking");
  };

  const goHome = () => {
    setFile(null);
    resetGame();
    push("/");
  };

  return (
    <Container>
      {!scoreForCurrentHash?.score || scoreForCurrentHash?.score < score ? (
        <Record>
          <Block>
            <h1>Congratulations!</h1>
            <h1>You have a new high score!</h1>
            <Score>{score.toFixed(2)}!</Score>
          </Block>
          <Block>
            <h2>On the video with id:</h2>
            <Hash>{hash}</Hash>
            <ScoreGraph />
            <h2>Your last high score at this devices was </h2>
            <Score>{scoreForCurrentHash?.score.toFixed(2) || 0}!</Score>
          </Block>
        </Record>
      ) : (
        <Record>
          <Block>
            <h1>Good job! You scored</h1>
            <Hash>{score.toFixed(2)}!</Hash>
          </Block>
          <Block>
            <h2>On the video with id:</h2>
            <Hash>{hash}</Hash>
            <ScoreGraph />
          </Block>
          <h2>Your highest score on this device is</h2>
          <Score> {scoreForCurrentHash?.score.toFixed(2) || 0}!</Score>
        </Record>
      )}
      <Actions>
        <Button onClick={restartGame}>
          <ReplayIcon />
        </Button>
        <Button onClick={goHome}>
          <HomeIcon />
        </Button>
      </Actions>
    </Container>
  );
};

export default ScoreView;

const Actions = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 4rem;
  width: 100%;
`;
const Block = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100vw;
  max-height: 100vh;
  max-width: 100vw;
  padding: 0.5rem;
  gap: 0.5rem;
  flex-direction: column;
  color: white;
  box-sizing: border-box;
  white-space: nowrap; /* Keep the text on a single line */
  overflow: hidden; /* Hide overflowed text */
  text-overflow: ellipsis; /* Show ellipsis when text overflows */
  padding-top: 70px;
`;

const Hash = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: gold;
  white-space: nowrap; /* Keep the text on a single line */
  overflow: hidden; /* Hide overflowed text */
  text-overflow: ellipsis; /* Show ellipsis when text overflows */
  padding: 1rem;
  max-width: 90vw;
`;

const Score = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: #4caf50;
`;

const Record = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;
