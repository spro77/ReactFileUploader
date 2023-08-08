import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";

const DropzoneContainer = styled.div`
  border: 2px dashed
    ${(props) =>
      props.isDragActive ? props.config.styles.progressColor : "#ccc"};
  padding: 20px;
  background-color: ${(props) => props.config.styles.backgroundColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  cursor: pointer;
`;

const UploadButton = styled.button`
  background-color: ${(props) => props.config.styles.progressColor};
  color: ${(props) => props.config.styles.color};
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => props.config.styles.backgroundColor};
  }
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
`;

const CheckmarkIcon = styled.span`
  color: green;
  font-size: 18px;
  margin-right: 5px;
`;

const FileUploader = ({
  config,
  initialFiles = [],
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onUploadCancel,
  onFilesChange,
  editing = false,
  error = "",
  serverErrors = [],
  serverWarnings = [],
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState("");

  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
    if (onFilesChange) onFilesChange([...files, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: config.multiple,
    maxFiles: config.maxFiles,
    accept: config.acceptedFileTypes,
    maxSize: config.maxSize,
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setMessage("Uploading...");

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });

    try {
      const response = await axios.post(config.uploadEndpoint, formData);
      console.log(response.data);
      setUploadedFiles([...uploadedFiles, ...files]);
      setMessage("");
      if (onUploadComplete) onUploadComplete(files, response.data);
    } catch (error) {
      setMessage("Error uploading files.");
      console.error("Upload error:", error);
      if (onUploadError) onUploadError(files, error);
    }
  };

  return (
    <DropzoneContainer
      {...getRootProps()}
      isDragActive={isDragActive}
      config={config}
    >
      <input {...getInputProps()} />
      <UploadButton onClick={handleUpload} config={config}>
        {config.uploadButtonText}
      </UploadButton>
      <p>{config.dropzoneText}</p>
      <ul>
        {files.map((file, index) => (
          <FileItem key={index}>
            {uploadedFiles.includes(file) && <CheckmarkIcon>✔</CheckmarkIcon>}
            {file.name}
          </FileItem>
        ))}
      </ul>
      <div>{message}</div>
    </DropzoneContainer>
  );
};

export default FileUploader;
