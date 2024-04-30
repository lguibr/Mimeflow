"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useGameActions, useGameViews } from "../contexts/Game";
import { useFile } from "../contexts/File";
import ScoreGraph from "../components/score/ScoreGraph";
import Button from "../components/core/Button";

const HomeView: React.FC = () => {
  const { push } = useRouter();
  const { setFile } = useFile();
  const { score } = useGameViews();
  const { togglePause, setHistory } = useGameActions();
  if (!score) {
    setFile(null);
    push("/");
    return null;
  }
  const resetGame = () => {
    setFile(null);
    setHistory([]);
    togglePause();
    push("/");
  };
  return (
    <main>
      <Container>
        <ScoreGraph />
        <Button onClick={resetGame}>Play Again</Button>
      </Container>
    </main>
  );
};

export default HomeView;

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding: 10rem;
  flex-direction: column;
  gap: 20%;
  color: white;
`;
