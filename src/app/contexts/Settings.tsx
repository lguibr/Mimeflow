import React, { createContext, useContext, useState, useEffect } from "react";

// Define the type for the context value
type ContextValue = {
  scorePreview: boolean;
  setScorePreview: React.Dispatch<React.SetStateAction<boolean>>;
  webcamPreview3D: boolean;
  setWebcamPreview3D: React.Dispatch<React.SetStateAction<boolean>>;
  videoPreview3D: boolean;
  setVidePreview3D: React.Dispatch<React.SetStateAction<boolean>>;
};

// Initial Context
const SettingsContext = createContext<ContextValue>({} as ContextValue);

// Provider component
export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [scorePreview, setScorePreview] = useState(true);
  const [webcamPreview3D, setWebcamPreview3D] = useState(false);
  const [videoPreview3D, setVidePreview3D] = useState(false);

  const checkScreenSize = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;

  // Function to determine if the screen is desktop size

  useEffect(() => {
    // Set initial values based on screen size
    const isDesktop = checkScreenSize();
    setWebcamPreview3D(isDesktop);
    setVidePreview3D(isDesktop);

    // Handle window resize
    function handleResize() {
      const isDesktop = checkScreenSize();
      setWebcamPreview3D(isDesktop);
      setVidePreview3D(isDesktop);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        scorePreview,
        setScorePreview,
        webcamPreview3D,
        setWebcamPreview3D,
        videoPreview3D,
        setVidePreview3D,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the context
export const useSettings = () => useContext(SettingsContext);
