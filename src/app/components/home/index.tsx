"use client";

import { useRouter } from "next/navigation";
import MultiUpload from "@/app/components/home/MultiUpload";
import { useFile } from "@/app/contexts/File";
import styled from "styled-components";
import Grid from "@/app/components/core/Grid";

const HomeView: React.FC = () => {
  const { file } = useFile();
  const { push } = useRouter();

  if (file) {
    push("/tracking");
  }
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <Container>
      <Grid gridSpan={{ xs: [1, 13], sm: [1, 13], md: [3, 11], lg: [4, 10] }}>
        <MultiUpload />
      </Grid>
    </Container>
  );
};

export default HomeView;

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  gap: 20%;
  color: white;
`;