import React, { createContext, useContext, useState, useEffect } from "react";

type ContextValue = {
  scorePreview: boolean;
  setScorePreview: React.Dispatch<React.SetStateAction<boolean>>;
  webcamPreview3D: boolean;
  setWebcamPreview3D: React.Dispatch<React.SetStateAction<boolean>>;
  videoPreview3D: boolean;
  setVidePreview3D: React.Dispatch<React.SetStateAction<boolean>>;
};

const SettingsContext = createContext<ContextValue>({} as ContextValue);

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

  useEffect(() => {
    const isDesktop = checkScreenSize();
    setWebcamPreview3D(isDesktop);
    setVidePreview3D(isDesktop);

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

export const useSettings = () => useContext(SettingsContext);
