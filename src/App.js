import FileUploader from "./FileUploader";

const Colors = {
  MainText: "#333",
  Primary: "lightgreen",
  Tertiary: "#f7f7f7",
};

const updatedSampleConfig = {
  uploadEndpoint: "http://localhost:5000/upload",
  autoupload: false,
  multiple: true,
  maxFiles: 5,
  acceptedFileTypes: {
    "image/png": [".png"],
    "text/html": [".html", ".htm"],
    video: [".mp4"],
  },
  maxSize: 5000000,
  showPreview: true,
  fileNameDisplay: true,
  progressDisplay: true,
  allowCancel: true,
  allowDownload: true,
  allowDelete: true,
  styles: {
    color: Colors.MainText,
    progressColor: Colors.Primary,
    backgroundColor: Colors.Tertiary,
  },
  dropzoneText: "...or drag and drop files here",
  uploadButtonText: "Choose a File",
};

export default function App() {
  return <FileUploader config={updatedSampleConfig} />;
}
