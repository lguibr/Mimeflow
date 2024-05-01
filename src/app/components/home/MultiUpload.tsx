import React, {
  useState,
  DragEvent,
  useCallback,
  useRef,
  useEffect,
} from "react";
import styled from "styled-components";
import { useFile } from "@/app/contexts/File";
import Logo from "../core/Logo";

type Props = {
  dragging: boolean;
};

const DragDrop = styled.div<Props>`
  border: ${({ dragging }) =>
    dragging ? ".5rem dashed #00f" : ".5rem dashed #aaa"};
  height: 50%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 6rem;
  font-size: 16px;
  border-radius: 5rem;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  gap: 4rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
    border-color: white;
  }
`;

const VideoUpload: React.FC = () => {
  const [dragging, setDragging] = useState(false);

  const { file, setFile, setHash } = useFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.type.startsWith("video/")) {
          setFile(droppedFile);
        } else {
          console.log("File is not a video");
        }
        e.dataTransfer.clearData();
      }
    },
    [setFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const selectedFile = fileList[0];
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
      } else {
        console.log("File is not a video");
      }
    }
  };

  useEffect(() => {
    const computeHash = async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setHash(hashHex);
    };

    if (file) computeHash(file);
  }, [file, setHash]);

  return (
    <DragDrop
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      dragging={dragging}
    >
      {file ? (
        <p>File ready: {file.name}</p>
      ) : (
        <>
          <h3>Drag and drop a video file here, or click to select a file.</h3>
          <Logo />
          <h4>
            The Mime Flow will initialized automatically after upload the file
          </h4>
        </>
      )}
      <input
        type="file"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleChange}
        accept="video/*"
      />
    </DragDrop>
  );
};

export default VideoUpload;
