import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import styled from "styled-components";

interface SnackbarContextType {
  showMessage: (message: string, type: "success" | "error") => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

const SnackbarContainer = styled.div<{ type: "success" | "error" }>`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  justify-content: center;
  align-items: center;
  background-color: ${({ type }) =>
    type === "success" ? "#4CAF50" : "#F44336"};
  color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 3px 5px 2px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  justify-content: center;
  min-width: 280px;
  z-index: 999999999999;
  height: 5rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackbarInfo, setSnackbarInfo] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showMessage = useCallback(
    (message: string, type: "success" | "error") => {
      console.log("showMessage", message, type);

      setSnackbarInfo({ message, type });
      setTimeout(() => setSnackbarInfo(null), 4000);
    },
    []
  );

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      {snackbarInfo && (
        <SnackbarContainer
          onClick={() => setSnackbarInfo(null)}
          type={snackbarInfo?.type ?? "success"}
        >
          {snackbarInfo?.message}
        </SnackbarContainer>
      )}
    </SnackbarContext.Provider>
  );
};

const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export { SnackbarProvider, useSnackbar };
