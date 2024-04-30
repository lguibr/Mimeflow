import React from "react";
import styled from "styled-components";

const ToggleButton = styled.button`
  background-color: #222;
  color: #fff;
  border: 2px solid #444;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 10px;
  outline: none;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #333;
  }
`;

const Button: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({
  children,
  onClick,
}) => {
  return <ToggleButton onClick={onClick}>{children}</ToggleButton>;
};

export default Button;
