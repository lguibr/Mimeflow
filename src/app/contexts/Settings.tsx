import React, { createContext, useContext, useState, useEffect } from "react";

type ContextValue = {
  scorePreview: boolean;
  webcamPreview3D: boolean;
  videoPreview3D: boolean;
};

const SettingsContext = createContext<ContextValue>({} as ContextValue);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const checkScreenSize = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024;
  const [scorePreview, setScorePreview] = useState(true);
  const [webcamPreview3D, setWebcamPreview3D] = useState(checkScreenSize());
  const [videoPreview3D, setVidePreview3D] = useState(checkScreenSize());

  return (
    <SettingsContext.Provider
      value={{
        scorePreview,
        webcamPreview3D,
        videoPreview3D,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
