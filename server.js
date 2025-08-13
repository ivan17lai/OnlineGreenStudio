const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import cors

const app = express();
const port = 3001; // Choose a port different from your main app

// Use CORS middleware
app.use(cors());

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route to handle file uploads
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    console.log(`File uploaded: ${req.file.filename}`);
    res.json({ message: 'File uploaded successfully!', url: fileUrl }); // Respond with the file URL
});

// New endpoint for frontend to check server status
app.get('/status', (req, res) => {
    res.status(200).send('Server is alive!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Uploads will be saved in: ${uploadsDir}`);
});