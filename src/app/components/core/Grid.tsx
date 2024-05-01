import React from "react";
import styled from "styled-components";

const breakpoints = {
  xs: "480px", // Extra small devices
  sm: "640px", // Small devices
  md: "768px", // Medium devices
  lg: "1024px", // Large devices
  xl: "1280px", // Extra large devices
};

const GridContainer = styled.div`
  display: grid;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  grid-template-columns: repeat(12, 1fr);
  place-items: start;
  box-sizing: border-box;
`;

interface GridContentProps {
  gridSpan: { [key: string]: number[] };
}

const GridContent = styled.div<{ $gridSpan: { [key: string]: number[] } }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  grid-column: ${(props) =>
    `${props.$gridSpan["xs"] ? props.$gridSpan["xs"][0] : 5} / ${
      props.$gridSpan["xs"] ? props.$gridSpan["xs"][1] : 8
    }`};

  @media (min-width: ${breakpoints.xs}) {
    grid-column: ${(props) =>
      `${props.$gridSpan["sm"] ? props.$gridSpan["sm"][0] : 5} / ${
        props.$gridSpan["sm"] ? props.$gridSpan["sm"][1] : 9
      }`};
  }
  @media (min-width: ${breakpoints.sm}) {
    grid-column: ${(props) =>
      `${props.$gridSpan["md"] ? props.$gridSpan["md"][0] : 5} / ${
        props.$gridSpan["md"] ? props.$gridSpan["md"][1] : 9
      }`};
  }
  @media (min-width: ${breakpoints.md}) {
    grid-column: ${(props) =>
      `${props.$gridSpan["lg"] ? props.$gridSpan["lg"][0] : 5} / ${
        props.$gridSpan["lg"] ? props.$gridSpan["lg"][1] : 9
      }`};
  }
  @media (min-width: ${breakpoints.lg}) {
    grid-column: ${(props) =>
      `${props.$gridSpan["xl"] ? props.$gridSpan["xl"][0] : 5} / ${
        props.$gridSpan["xl"] ? props.$gridSpan["xl"][1] : 9
      }`};
  }
`;

interface CentralizedLayoutProps {
  children: React.ReactNode;
  gridSpan: { [key: string]: number[] };
}

const CentralizedLayout: React.FC<CentralizedLayoutProps> = ({
  children,
  gridSpan,
}) => {
  return (
    <GridContainer>
      <GridContent $gridSpan={gridSpan}>{children}</GridContent>
    </GridContainer>
  );
};

export default CentralizedLayout;
