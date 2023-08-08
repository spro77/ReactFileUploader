import React, { useState } from "react";
import axios from "axios";

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
    setMessage(""); // Reset the message when new files are selected.
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    setMessage("Uploading...");

    // Prepare FormData to send files
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });

    try {
      const response = await axios.post("https://httpbin.org/post", formData);

      console.log(response.data); // Log the response for debugging purposes
      setMessage("Files uploaded successfully!");
    } catch (error) {
      setMessage("Error uploading files.");
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <div>
        Selected Files:
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleUpload}>Upload</button>
      <div>{message}</div>
    </div>
  );
};

export default FileUploader;
