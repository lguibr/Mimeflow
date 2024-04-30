import React from "react";
import styled from "styled-components";

const ToggleButton = styled.button`
  background-color: #222;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s;
  padding: 5px;

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
