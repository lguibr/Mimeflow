import React, { useState } from "react";
import styled from "styled-components";

const SwitchContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 10px 0;
  background-color: #222;
  border-radius: 8px;
  width: fit-content;
`;

const Option = styled.button<{ isSelected: boolean }>`
  background-color: ${(props) => (props.isSelected ? "#444" : "#222")};
  color: #fff;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #555;
  }
`;

interface SwitchProps<T> {
  options: T[];
  selectedOption: T;
  setSelectedOption: (option: T) => void;
}

function Switch<T>({
  options,
  setSelectedOption,
  selectedOption,
}: SwitchProps<T>): JSX.Element {
  const handleSelection = (option: T) => {
    setSelectedOption(option);
  };

  return (
    <SwitchContainer>
      {options.map((option, index) => (
        <Option
          key={index}
          isSelected={option === selectedOption}
          onClick={() => handleSelection(option)}
        >
          {String(option)}
        </Option>
      ))}
    </SwitchContainer>
  );
}

export default Switch;
