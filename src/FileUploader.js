import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

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
  // ... [rest of the props]
}) => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFiles = (inputFiles) => {
    console.log("Entering handleFiles");
    const fileList = Array.isArray(inputFiles) ? inputFiles : Array.from(inputFiles);
    const newFiles = fileList.map(file => ({
      data: file,
      progress: 0
    }));
    setFiles(prevFiles => {
      return [...prevFiles, ...newFiles];
    });
    if (config.autoupload) {
      console.log("Auto-upload condition met in handleFiles");
      handleUpload(newFiles);
    }
    console.log("Exiting handleFiles");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: config.acceptedFileTypes,
  });

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  /*const handleFileChange = (event) => {
    handleFiles(event.target.files);
  };*/

  /*const simulateProgress = (file) => {
    let progress = 0;
    const interval = setInterval(() => {
      // Increment the progress
      progress += 5;
      if (progress > 95) {
        clearInterval(interval);
      }
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.data === file.data) {
            return { ...f, progress };
          }
          return f;
        })
      );
    }, 200);
    return interval;
  };*/

  const handleUpload = async (filesToUpload) => {
    console.log("Entering handleUpload with files:", filesToUpload);
    if (filesToUpload.length === 0) {
      return;
    }

    setMessage('Uploading...');

    const uploadPromises = filesToUpload.map(file => {
      const formData = new FormData();
      formData.append('file', file.data);
      return axios.post(config.uploadEndpoint, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setFiles(prevFiles => prevFiles.map(f => {
            if (f.data === file.data) {
              return { ...f, progress };
            }
            return f;
          }));
        }
      });
    });

    try {
      await Promise.all(uploadPromises);
      setUploadedFiles(prevUploaded => [...prevUploaded, ...filesToUpload]);
      setMessage('Files uploaded successfully!');
    } catch (error) {
      setMessage('Error uploading files.');
      console.error('Upload error:', error);
    }
    console.log("Exiting handleUpload");
  };

  return (
    <DropzoneContainer isDragActive={isDragActive} config={config}>
      <input
        {...getInputProps()}
        ref={fileInputRef}
        // onChange={handleFileChange}
      />
      <UploadButton
        {...getRootProps()}
        onClick={handleButtonClick}
        config={config}
      >
        {config.addFileButtonText || "Add a File"}
      </UploadButton>
      <p>{config.dropzoneText}</p>
      <ul>
        {files.map((file, index) => (
          <FileItem key={index}>
            {uploadedFiles.includes(file) && <CheckmarkIcon>✔</CheckmarkIcon>}
            {file.data.name} - {file.progress}%
          </FileItem>
        ))}
      </ul>
      {!config.autoupload && files.length > 0 && (
        <UploadButton onClick={handleUpload} config={config}>
          Upload
        </UploadButton>
      )}
      <div>{message}</div>
    </DropzoneContainer>
  );
};

export default FileUploader;
