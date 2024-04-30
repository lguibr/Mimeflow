import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
} from "react";

type FileContextType = {
  file: File | null;
  hash: string;
  setFile: (file: File | null) => void;
  setHash: (file: string) => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

type FileProviderProps = {
  children: ReactNode;
};

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const currentFile = useMemo(() => file, [file]);
  return (
    <FileContext.Provider value={{ file: currentFile, setFile, hash, setHash }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};
