import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import SettingsIcon from "./SettingsIcon";

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
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

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  background-color: #333;
  min-width: 150px;

  z-index: 1;
  border-radius: 8px;
  margin-top: 5px;
  right: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
`;

const Dropdown: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <DropdownContainer ref={ref} onClick={(e) => e.stopPropagation()}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <SettingsIcon />
      </DropdownButton>
      <DropdownContent isOpen={isOpen}>{children}</DropdownContent>
    </DropdownContainer>
  );
};

export default Dropdown;
