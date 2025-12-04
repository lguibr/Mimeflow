import React from "react";
import styled from "styled-components";

interface LogoProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ width, height, className, style }) => {
  return (
    <img
      src="/logo.png"
      alt="Mimeflow Logo"
      className={className}
      style={{
        width: width || "100px",
        height: height || "100px",
        objectFit: "contain",
        ...style,
      }}
    />
  );
};

export default Logo;

const Path = styled.path<{ color: string }>`
  fill: ${({ color }) => color};
  stroke-width: 0.3;
`;
