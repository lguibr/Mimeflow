import React from 'react';
import styled from 'styled-components';

interface BurnBarProps {
  momentum: number; // 0 to 100
}

export const BurnBar: React.FC<BurnBarProps> = ({ momentum }) => {
  const isFlowState = momentum >= 90;

  return (
    <Container>
      <Track>
        <Fill $momentum={momentum} $isFlow={isFlowState} />
      </Track>
      <Label $isFlow={isFlowState}>
        {isFlowState ? 'FLOW STATE' : 'MOMENTUM'}
      </Label>
    </Container>
  );
};

// Stitch-inspired styling for glassmorphic Apple Fitness+ aesthetic
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 10px;
  height: 50vh;
  min-height: 300px;
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
`;

const Track = styled.div`
  width: 10px;
  height: 100%;
  background: rgba(38, 38, 38, 0.6); // surface-variant with opacity
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 9999px;
  border: 1px solid rgba(72, 72, 72, 0.2); // outline-variant ghost border
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
`;

const Fill = styled.div<{ $momentum: number; $isFlow: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${(props) => Math.min(Math.max(props.$momentum, 0), 100)}%;
  background: ${(props) =>
    props.$isFlow
      ? 'linear-gradient(180deg, #db90ff 0%, #9392ff 100%)' // Electric Shift Primary/Secondary
      : 'linear-gradient(180deg, #ff6e80 0%, #d277ff 100%)'}; // Sunset Kinetic Tertiary/Primary-dim
  transition: height 0.3s ease-out, background 0.5s ease-in-out;
  border-radius: 9999px;
  
  /* Outer glow effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: ${(props) =>
      props.$isFlow ? '0 0 20px rgba(219, 144, 255, 0.8)' : '0 0 10px rgba(255, 110, 128, 0.4)'};
    border-radius: 9999px;
  }
`;

const Label = styled.div<{ $isFlow: boolean }>`
  transform: rotate(-90deg) translateX(-50%);
  transform-origin: left top;
  position: absolute;
  top: 50%;
  right: -50px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: ${(props) => (props.$isFlow ? '#db90ff' : '#ababab')}; // primary vs on-surface-variant a
  text-shadow: ${(props) => (props.$isFlow ? '0 0 10px rgba(219, 144, 255, 0.5)' : 'none')};
  transition: color 0.5s ease;
  white-space: nowrap;
`;
