"use client";

import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import styled from "styled-components";

type ButtonProps = {
  backgroundColor: string;
  disabled?: boolean;
};

const Button = ({
  backgroundColor,
  children,
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  const { push } = useRouter();
  const handleClick = () => {
    push("/tracking");
  };
  return (
    <Btn onClick={handleClick} backgroundColor={backgroundColor} {...rest}>
      {children}
    </Btn>
  );
};

export default Button;

const Btn = styled.button<ButtonProps>`
  background-color: ${(props) => props.backgroundColor};
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  font-weight: 600;
  transition: background-color 0.3s;
  &:hover {
    background-color: #333;
  }
  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;
