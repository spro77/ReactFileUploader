const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // For file operations

const app = express();

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueID = Date.now().toString();
        const newFilename = `${uniqueID}-${file.originalname}`;
        cb(null, newFilename);
    }
});

const upload = multer({storage: storage});

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        // Extract the unique ID from the filename
        const fileID = req.file.filename.split('-')[0];
        const fileLink = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({success: true, message: 'File uploaded successfully', link: fileLink, id: fileID});
    } else {
        res.json({success: false, message: 'No file uploaded'});
    }
});

app.delete('/delete/:id', (req, res) => {
    const fileID = req.params.id;
    const fileDirectory = path.join(__dirname, 'uploads');

    // Find file with the provided ID
    fs.readdir(fileDirectory, (err, files) => {
        if (err) {
            return res.status(500).json({success: false, message: 'Internal server error'});
        }

        const fileToDelete = files.find(file => file.startsWith(fileID));

        if (!fileToDelete) {
            return res.status(404).json({success: false, message: 'File not found'});
        }

        // Delete the file
        fs.unlink(path.join(fileDirectory, fileToDelete), (err) => {
            if (err) {
                return res.status(500).json({success: false, message: 'Failed to delete file'});
            }
            res.json({success: true, message: 'File deleted successfully'});
        });
    });
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
