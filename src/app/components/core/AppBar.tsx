import React from "react";
import styled from "styled-components";
import Logo from "./Logo";
import Dropdown from "./Dropdown";
import Switch from "./Switch";
import { useSettings } from "@/app/contexts/Settings";
import Link from "next/link";
import { useGameActions } from "@/app/contexts/Game";
import { useFile } from "@/app/contexts/File";

const AppBarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #333;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
`;

const AppBarTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  display: flex;
  gap: 10px;
  cursor: pointer;
`;

const AppBar = () => {
  const {
    scorePreview,
    setScorePreview,
    setVidePreview3D,
    videoPreview3D,
    setWebcamPreview,
    webcamPreview3D,
    setWebcamPreview3D,
    webcamPreview,
  } = useSettings();
  const { setHistory } = useGameActions();
  const { setFile } = useFile();

  const resetGame = () => {
    setFile(null);
    setHistory([]);
  };

  return (
    <AppBarContainer onClick={(e) => e.stopPropagation()}>
      <AppBarTitle onClick={resetGame}>
        <Link href={"/"}>
          <Logo width="30px" height="30px" />
        </Link>
        <p>Mime Flow</p>
      </AppBarTitle>
      <Dropdown>
        <Row>
          <h3>Preview Score</h3>
          <Switch
            options={[false, true]}
            setSelectedOption={setScorePreview}
            selectedOption={scorePreview}
          />
        </Row>
        <Row>
          <h3>3D Webcam Pose</h3>
          <Switch
            options={[false, true]}
            setSelectedOption={setWebcamPreview3D}
            selectedOption={webcamPreview3D}
          />
        </Row>
        <Row>
          <h3>3D Video Pose</h3>
          <Switch
            options={[false, true]}
            setSelectedOption={setVidePreview3D}
            selectedOption={videoPreview3D}
          />
        </Row>
        <Row>
          <h3>Preview Webcam</h3>
          <Switch
            options={[false, true]}
            setSelectedOption={setWebcamPreview}
            selectedOption={webcamPreview}
          />
        </Row>
      </Dropdown>
    </AppBarContainer>
  );
};

export default AppBar;

const Row = styled.div`
  border-radius: 8px;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
