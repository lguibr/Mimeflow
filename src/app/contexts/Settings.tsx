import React, { createContext, useContext, useState, useEffect } from "react";

type ContextValue = {
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
  const webcamPreview3D = checkScreenSize();
  const videoPreview3D = checkScreenSize();

  return (
    <SettingsContext.Provider
      value={{
        webcamPreview3D,
        videoPreview3D,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
