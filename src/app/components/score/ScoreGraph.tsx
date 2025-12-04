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
  Filler,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const LineGraph: React.FC = () => {
  const { history } = useGameViews();

  const labels = history.map((_, index) => index.toString());

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Score",
        data: history,
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)", // Blue with low opacity
        borderColor: "#60A5FA", // Blue-400
        pointBackgroundColor: "#1e1e1e",
        pointBorderColor: "#60A5FA",
        pointHoverBackgroundColor: "#60A5FA",
        pointHoverBorderColor: "#fff",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          borderColor: "transparent",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          maxTicksLimit: 8,
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          borderColor: "transparent",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
        },
        border: {
          display: false,
        },
        min: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(20, 20, 20, 0.9)",
        titleColor: "#fff",
        bodyColor: "#ccc",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        callbacks: {
          title: (context: any) => `Frame ${context[0].label}`,
          label: (context: any) => `Score: ${Math.round(context.raw)}`,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
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
  width: 100%;
  height: 100%;
`;
