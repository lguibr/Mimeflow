import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

// Define the type for the context state
type FileContextType = {
  file: File | null;
  setFile: (file: File | null) => void;
};

// Create the context with a default value
const FileContext = createContext<FileContextType | undefined>(undefined);

// Create a provider component
type FileProviderProps = {
  children: ReactNode;
};

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const currentFile = useMemo(() => file, [file]);
  return (
    <FileContext.Provider value={{ file: currentFile, setFile }}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook to use the file context
export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};
