import FileUploader from "./FileUploader";

const Colors = {
  MainText: '#333',
  Primary: '#3498db',
  Tertiary: '#f7f7f7'
};

const updatedSampleConfig = {
  uploadEndpoint: 'https://httpbin.org/post',
  multiple: true,
  maxFiles: 5,
  acceptedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
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
  dropzoneText: '...or drag and drop files here',
  uploadButtonText: 'Upload a File',
};

export default function App() {
  const onUploadComplete = () => {
    
  }
  return <FileUploader config={updatedSampleConfig} />;
}
