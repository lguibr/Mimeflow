import React from "react";
import styled from "styled-components";
import Logo from "./Logo";
import Dropdown from "./Dropdown";
import Switch from "./Switch";
import { useSettings } from "@/app/contexts/Settings";

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
`;

const AppBarTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  display: flex;
  gap: 10px;
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
  return (
    <AppBarContainer onClick={(e) => e.stopPropagation()}>
      <AppBarTitle>
        <Dropdown>
          <div>
            <p>Preview Score</p>
            <Switch
              options={[false, true]}
              setSelectedOption={setScorePreview}
              selectedOption={scorePreview}
            />
          </div>
          <div>
            <p>3D Webcam Pose</p>
            <Switch
              options={[false, true]}
              setSelectedOption={setWebcamPreview3D}
              selectedOption={webcamPreview3D}
            />
          </div>
          <div>
            <p>3D Video Pose</p>
            <Switch
              options={[false, true]}
              setSelectedOption={setVidePreview3D}
              selectedOption={videoPreview3D}
            />
          </div>
          <div>
            <p>Preview Webcam</p>
            <Switch
              options={[false, true]}
              setSelectedOption={setWebcamPreview}
              selectedOption={webcamPreview}
            />
          </div>
        </Dropdown>

        <Logo width="30px" height="30px" />
        <p>Mime Flow</p>
      </AppBarTitle>
    </AppBarContainer>
  );
};

export default AppBar;
