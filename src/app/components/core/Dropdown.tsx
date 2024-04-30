import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

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

  &:hover {
    background-color: #333;
  }
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  background-color: #333;
  min-width: 300px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 5px;
`;

const HamburgerIcon = styled.svg`
  fill: #fff; // White fill color
  width: 40px; // Width of the icon
  height: 30px; // Height of the icon
  cursor: pointer; // Cursor indicates that it's clickable
  &:hover {
    fill: #ccc; // Lighter fill on hover
  }
`;

const MenuIcon: React.FC = () => {
  return (
    <HamburgerIcon viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="20"></rect>
      <rect y="30" width="100" height="20"></rect>
      <rect y="60" width="100" height="20"></rect>
    </HamburgerIcon>
  );
};

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
        <MenuIcon />
      </DropdownButton>
      <DropdownContent isOpen={isOpen}>{children}</DropdownContent>
    </DropdownContainer>
  );
};

export default Dropdown;
