const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});

app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({success: true, message: 'File uploaded successfully'});
    } else {
        res.json({success: false, message: 'No file uploaded'});
    }
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
