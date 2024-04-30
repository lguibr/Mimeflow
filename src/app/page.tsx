"use client";

import { useRouter } from "next/navigation";
import MultiUpload from "@/app/components/home/MultiUpload";
import { useFile } from "./contexts/File";
import styled from "styled-components";
import Logo from "@/app/components/core/Logo";

const HomeView: React.FC = () => {
  const { file } = useFile();
  const { push } = useRouter();
  if (file) {
    push("/tracking");
  }
  return (
    <main>
      <Container>
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
  padding: 2rem;
  flex-direction: column;
  gap: 20%;
  color: white;
`;
