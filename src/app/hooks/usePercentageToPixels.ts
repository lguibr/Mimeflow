import { useCallback } from "react";

const usePercentageToPixels = () => {
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
