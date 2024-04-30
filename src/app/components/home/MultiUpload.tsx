import React, {
  useState,
  DragEvent,
  useCallback,
  useRef,
  useEffect,
} from "react";
import styled from "styled-components";
import { useFile } from "@/app/contexts/File"; // Adjust the import path as necessary

type Props = {
  dragging: boolean;
};

const DragDrop = styled.div<Props>`
  border: ${({ dragging }) =>
    dragging ? "3px dashed #00f" : "3px dashed #aaa"};
  height: 200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    border-color: white;
  }
`;

const VideoUpload: React.FC = () => {
  const [dragging, setDragging] = useState(false);

  const { file, setFile } = useFile();
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
    if (file) {
      console.log("File ready:", file);
    }
  }, [file]);

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
        <p>Drag and drop a video file here, or click to select a file. </p>
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
