import React from "react";
import styled from "styled-components";

// Breakpoints for responsiveness
const breakpoints = {
  xs: "480px", // Extra small devices
  sm: "640px", // Small devices
  md: "768px", // Medium devices
  lg: "1024px", // Large devices
  xl: "1280px", // Extra large devices
};

// GridContainer styled component
const GridContainer = styled.div`
  display: grid;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  grid-template-columns: repeat(12, 1fr);
  place-items: start; // Aligns content from the top
  box-sizing: border-box;
`;

// GridContent styled component for specifying column start and end across breakpoints
interface GridContentProps {
  gridSpan: { [key: string]: number[] };
}

const GridContent = styled.div<GridContentProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  grid-column: ${(props) =>
    `${props.gridSpan["xs"] ? props.gridSpan["xs"][0] : 4} / ${
      props.gridSpan["xs"] ? props.gridSpan["xs"][1] : 8
    }`};

  @media (min-width: ${breakpoints.xs}) {
    grid-column: ${(props) =>
      `${props.gridSpan["sm"] ? props.gridSpan["sm"][0] : 4} / ${
        props.gridSpan["sm"] ? props.gridSpan["sm"][1] : 8
      }`};
  }
  @media (min-width: ${breakpoints.sm}) {
    grid-column: ${(props) =>
      `${props.gridSpan["md"] ? props.gridSpan["md"][0] : 4} / ${
        props.gridSpan["md"] ? props.gridSpan["md"][1] : 8
      }`};
  }
  @media (min-width: ${breakpoints.md}) {
    grid-column: ${(props) =>
      `${props.gridSpan["lg"] ? props.gridSpan["lg"][0] : 4} / ${
        props.gridSpan["lg"] ? props.gridSpan["lg"][1] : 8
      }`};
  }
  @media (min-width: ${breakpoints.lg}) {
    grid-column: ${(props) =>
      `${props.gridSpan["xl"] ? props.gridSpan["xl"][0] : 4} / ${
        props.gridSpan["xl"] ? props.gridSpan["xl"][1] : 8
      }`};
  }
`;

// Props type for the CentralizedLayout including children and gridSpan
interface CentralizedLayoutProps {
  children: React.ReactNode;
  gridSpan: { [key: string]: number[] };
}

// CentralizedLayout component
const CentralizedLayout: React.FC<CentralizedLayoutProps> = ({
  children,
  gridSpan,
}) => {
  return (
    <GridContainer>
      <GridContent gridSpan={gridSpan}>{children}</GridContent>
    </GridContainer>
  );
};

export default CentralizedLayout;
