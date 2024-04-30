import React from "react";
import { Line } from "react-chartjs-2";
import styled from "styled-components";
import { useGameViews } from "@/app/contexts/Game";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const LineGraph: React.FC = () => {
  const { history, score } = useGameViews();

  const labels = history.map((_, index) => index.toString());
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Game Score History",
        data: history,
        fill: false,
        borderColor: "#4CAF50",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Frame",
        },
      },
      y: {
        title: {
          display: true,
          text: "Score",
        },
        min: Math.min(...history),
        max: Math.max(...history),
      },
    },
    plugins: {
      legend: {
        display: false, // Set to true if you want to show the legend
      },
    },
  };

  return (
    <Container>
      <Line data={data} options={options} />
    </Container>
  );
};

export default LineGraph;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 300px;
  margin-top: 20px;
`;
