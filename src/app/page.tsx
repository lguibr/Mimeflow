"use client";

import { useRouter } from "next/navigation";
import MultiUpload from "./components/MultiUpload";
import { useFile } from "./contexts/File";
import styled from "styled-components";

const HomeView: React.FC = () => {
  const { file } = useFile();
  const { push } = useRouter();
  if (file) {
    push("/tracking");
  }
  return (
    <main>
      <Container>
        <h1>Project Mimic</h1>
        <MultiUpload />
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
