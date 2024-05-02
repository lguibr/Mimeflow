"use client";

import { useRouter } from "next/navigation";
import MultiUpload from "@/app/components/home/MultiUpload";
import { useFile } from "@/app/contexts/File";
import styled from "styled-components";
import Grid from "@/app/components/core/Grid";
import { useEffect } from "react";

const HomeView: React.FC = () => {
  const { file } = useFile();
  const { push } = useRouter();

  useEffect(() => {
    if (file) {
      push("/tracking");
    }
  }, [file, push]);

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
  padding-bottom: 50px;
  padding: 2rem;
`;
