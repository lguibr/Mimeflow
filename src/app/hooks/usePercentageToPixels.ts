import { useCallback } from "react";

// This hook returns a function to convert percentages to pixel dimensions.
const usePercentageToPixels = () => {
  // Function that takes width and height percentages and returns their pixel values
  const calculatePixels = useCallback(
    (widthPercent: number, heightPercent: number) => {
      const widthInPixels = window.innerWidth * (widthPercent / 100);
      const heightInPixels = window.innerHeight * (heightPercent / 100);
      return [widthInPixels, heightInPixels];
    },
    []
  );

  return calculatePixels;
};

export default usePercentageToPixels;
