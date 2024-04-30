import React from "react";
import { Doughnut } from "react-chartjs-2";
import styled from "styled-components";
import { useGameViews } from "@/app/contexts/Game";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const getColor = (value: number) => {
  const hue = (value * 120).toString(10);
  return `hsl(${hue}, 100%, 50%)`;
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
`;

const InfoText = styled.div<{ color: string }>`
  position: absolute;
  top: calc(50% + 3rem);
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${(props) => props.color};
  font-size: 3rem;
  text-align: center;
`;
const SubInfoText = styled.div`
  position: absolute;
  top: calc(50% + +8rem);
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffffb3;
  font-size: 2rem;
  text-align: center;
  width: 100%;
`;

const SimilarityDisplay: React.FC = () => {
  const { score, similarity } = useGameViews();

  const data = {
    datasets: [
      {
        data: [similarity * 100, 100 - similarity * 100],
        backgroundColor: [getColor(similarity), "#000000"],
        borderColor: ["#000000", "#000000"],
        borderWidth: 3,
        cutout: "80%",
      },
    ],
  };

  const options = {
    rotation: 270,
    circumference: 180,
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <Container>
      <Doughnut data={data} options={options} />
      <InfoText color={getColor(similarity)}>{similarity.toFixed(2)}</InfoText>
      <SubInfoText>Score : {score.toFixed(2)}</SubInfoText>
    </Container>
  );
};

export default SimilarityDisplay;
