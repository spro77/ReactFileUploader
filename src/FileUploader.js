import React, { useRef, useState, useEffect } from 'react';
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

const Thumbnail = styled.img`
    margin-right: 10px; // Adds space to the right of the thumbnail
    width: 50px;
    height: 50px;
    object-fit: cover;
`;

const FileName = styled.p`
    margin-right: 10px; // Adds space to the right of the filename
`;

const StyledProgress = styled.progress`
    color: ${props => props.color};
`;

const IconBase = styled.svg`
    width: 24px;
    height: 24px;
    cursor: pointer;
    margin: 0 5px;

    &:hover {
        opacity: 0.7;
    }
`;

const DeleteIcon = styled(IconBase)`
    fill: ${props => props.color || "#FF0000"};
`;

const DownloadIcon = styled(IconBase)`
    fill: ${props => props.color || "#007BFF"};
`;

const FileUploader = ({
  config,
  // ... [rest of the props]
}) => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  /*useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault();
    };

    const handleDrop = (event) => {
      event.preventDefault();
    };

    // Attach the event listeners
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    // Cleanup function to remove the event listeners when the component unmounts
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);*/

  const handleFiles = (inputFiles) => {
    const fileList = Array.isArray(inputFiles) ? inputFiles : Array.from(inputFiles);
    const newFiles = fileList.map(file => ({
      data: file,
      progress: 0,
      isUploaded: false
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);

    // If autoUpload is true, upload the new files immediately
    if (config.autoUpload) {
      handleUpload(newFiles);
    }
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

  const handleUpload = async (filesToUpload = files) => {
    // Filter out files that have already been uploaded
    const filesToActuallyUpload = filesToUpload.filter(file => !file.isUploaded);

    // If there are no files to upload, exit
    if (filesToActuallyUpload.length === 0) return;

    // Begin uploading process
    setUploading(true);

    const uploadPromises = filesToActuallyUpload.map(async (fileObj) => {
      const formData = new FormData();
      formData.append("file", fileObj.data);

      try {
        const response = await axios.post(config.uploadEndpoint, formData, {
          onUploadProgress: progressEvent => {
            let totalLength;
            if (progressEvent.lengthComputable) {
              totalLength = progressEvent.total;
            } else if (progressEvent.target) {
              totalLength = progressEvent.target.getResponseHeader('content-length') || progressEvent.target.getResponseHeader('x-decompressed-content-length');
            } else {
              totalLength = null;
            }
            if (totalLength) {
              const progress = Math.round((progressEvent.loaded * 100) / totalLength);
              updateFileProgress(fileObj.data, progress);
            }
          }
        });

        // Assuming server responds with { id: '123', link: '/path/to/file' }
        return {
          ...fileObj,
          isUploaded: true,
          id: response.data.id,
          link: response.data.link
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        // For this example, we'll consider any error as a failed upload.
        return {
          ...fileObj,
          isUploaded: false,
          error: true
        };
      }
    });

    const updatedFiles = await Promise.all(uploadPromises);

    setFiles(prevFiles => {
      return prevFiles.map(fileObj => {
        const updatedFile = updatedFiles.find(uf => uf.data === fileObj.data);
        return updatedFile || fileObj;
      });
    });

    setUploading(false);
  };

  const handleDelete = async (e, fileId) => {
    e.stopPropagation();

    try {
      await axios.delete(`http://localhost:5000/delete/${fileId}`);
      // Remove the file from the files state after successful deletion
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDownload = async (e, fileLink, fileName) => {
    e.stopPropagation();

    try {
      const response = await fetch(fileLink);
      const blob = await response.blob();
      console.log('blob', blob)
      const url = window.URL.createObjectURL(blob);
      console.log('url', url)
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName || 'file';

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };


  const allFilesUploaded = () => {
    return files.every(file => file.isUploaded);
  };

  return (
    <DropzoneContainer {...getRootProps()} isDragActive={isDragActive} config={config}>
      {/*<input
        {...getInputProps()}
        ref={fileInputRef}
        // onChange={handleFileChange}
      />*/}
      <UploadButton
        // onClick={handleButtonClick}
        config={config}
      >
        {config.addFileButtonText || 'Add a File'}
      </UploadButton>
      <p>{config.dropzoneText}</p>
      <ul>
        {files.map((file, index) => (
          <FileItem key={index}>
            {/* Display Thumbnail for Image Files */}
            {
              config.showPreview && file.data.type.startsWith("image/") &&
              <Thumbnail
                  src={URL.createObjectURL(file.data)}
                  alt={file.data.name}
              />
            }
            {/* Filenames */}
            {
              config.fileNameDisplay && <FileName>{file.data.name}</FileName>
            }
            {/* Display Progress or Buttons */}
            {
              file.isUploaded
              ?
              <div>
                <DeleteIcon
                    color={config.styles.progressColor}
                    onClick={() => handleDelete(e, file.id)}
                    viewBox="0 0 24 24"
                >
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </DeleteIcon>
                <DownloadIcon
                    color={config.styles.progressColor}
                    onClick={() => handleDownload(e, file.link, file.data.name)}
                    viewBox="0 0 24 24"
                >
                  <path d="M19,9H15V3H9V9H5L12,16L19,9M5,18V20H19V18H5Z" />
                </DownloadIcon>
              </div>
              :
              config.progressDisplay
              ?
              <StyledProgress value={file.progress} max="100" primaryColor={config.styles.progressColor} />
              :
              null
            }
          </FileItem>
        ))}
      </ul>
      {!config.autoupload && !allFilesUploaded() && (
        <UploadButton onClick={() => handleUpload(files)} config={config}>
          Upload
        </UploadButton>
      )}
      <div>{message}</div>
    </DropzoneContainer>
  );
};

export default FileUploader;
