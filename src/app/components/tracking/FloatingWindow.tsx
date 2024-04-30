import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";

interface DraggableStyleProps {
  x: number;
  y: number;
  zIndex: number;
  width: number;
  height: number;
}

const DraggableWindow = styled.div.attrs<DraggableStyleProps>((props) => ({
  style: {
    left: `${props.x}px`,
    top: `${props.y}px`,
    zIndex: props.zIndex,
    width: `${props.width}px`,
    height: `${props.height}px`,
  },
}))<DraggableStyleProps>`
  position: fixed;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface FloatingWindowProps {
  zIndex?: number;
  children: React.ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface Position {
  x: number;
  y: number;
}

const AppBarHeight = 100; // Define the height of the AppBar

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  zIndex = 9,
  children,
  x = 0,
  y = AppBarHeight, // Set initial y to AppBarHeight to start below the AppBar
  width = 200,
  height = 200,
}) => {
  const constrainPosition = useCallback(
    (x: number, y: number) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const constrainedX = Math.min(Math.max(0, x), viewportWidth - width);
      const constrainedY = Math.min(
        Math.max(AppBarHeight, y),
        viewportHeight - height
      ); // Prevent y from being less than AppBarHeight
      return { x: constrainedX, y: constrainedY };
    },
    [width, height]
  );

  const [dragging, setDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>(() =>
    constrainPosition(x, y)
  );
  const [relPosition, setRelPosition] = useState<Position>({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setDragging(true);
      setRelPosition({
        x: e.pageX - position.x,
        y: e.pageY - position.y,
      });
      e.stopPropagation();
      e.preventDefault();
    },
    [position]
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        const newX = e.pageX - relPosition.x;
        const newY = e.pageY - relPosition.y;
        const constrainedPosition = constrainPosition(newX, newY);
        setPosition(constrainedPosition);
      }
    },
    [dragging, relPosition, constrainPosition]
  );

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  return (
    <DraggableWindow
      x={position.x}
      y={position.y}
      zIndex={zIndex}
      width={width}
      height={height}
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </DraggableWindow>
  );
};

export default FloatingWindow;
