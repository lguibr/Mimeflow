import React, { createContext, useContext, useState, useEffect } from "react";

// Define the type for the context value
type ContextValue = {
  webcamPreview: boolean;
  setWebcamPreview: React.Dispatch<React.SetStateAction<boolean>>;
  scorePreview: boolean;
  setScorePreview: React.Dispatch<React.SetStateAction<boolean>>;
  webcamPreview3D: boolean;
  setWebcamPreview3D: React.Dispatch<React.SetStateAction<boolean>>;
  videoPreview3D: boolean;
  setVidePreview3D: React.Dispatch<React.SetStateAction<boolean>>;
  model: "lite" | "full" | "heavy";
  setModel: React.Dispatch<React.SetStateAction<"lite" | "full" | "heavy">>;
};

// Initial Context
const SettingsContext = createContext<ContextValue>({} as ContextValue);

// Provider component
export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [webcamPreview, setWebcamPreview] = useState(false);
  const [scorePreview, setScorePreview] = useState(false);
  const [webcamPreview3D, setWebcamPreview3D] = useState(false);
  const [videoPreview3D, setVidePreview3D] = useState(false);

  const checkScreenSize = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;
  const [model, setModel] = useState<"lite" | "full" | "heavy">(
    checkScreenSize() ? "heavy" : "lite"
  );

  // Function to determine if the screen is desktop size

  useEffect(() => {
    // Set initial values based on screen size
    const isDesktop = checkScreenSize();
    setWebcamPreview(isDesktop);
    setScorePreview(isDesktop);
    setWebcamPreview3D(isDesktop);
    setVidePreview3D(isDesktop);

    // Handle window resize
    function handleResize() {
      const isDesktop = checkScreenSize();
      setWebcamPreview(isDesktop);
      setScorePreview(isDesktop);
      setWebcamPreview3D(isDesktop);
      setVidePreview3D(isDesktop);
    }
    console.log({ model });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [model]);

  return (
    <SettingsContext.Provider
      value={{
        webcamPreview,
        setWebcamPreview,
        scorePreview,
        setScorePreview,
        webcamPreview3D,
        setWebcamPreview3D,
        videoPreview3D,
        setVidePreview3D,
        model,
        setModel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the context
export const useSettings = () => useContext(SettingsContext);
