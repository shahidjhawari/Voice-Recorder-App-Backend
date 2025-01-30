const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxampilpv',
  api_key: '275126976155417',
  api_secret: 'B5S8aupE03A3VWLT8HbCOhRfLLY',
});

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle file uploads to Cloudinary
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Convert the file buffer to a base64 string
    const fileBase64 = req.file.buffer.toString('base64');
    const fileUri = `data:${req.file.mimetype};base64,${fileBase64}`;

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      resource_type: 'auto', // Automatically detect the file type (audio, video, etc.)
      folder: 'voice-recordings', // Optional: Store files in a specific folder
    });

    res.status(200).json({
      message: 'File uploaded successfully.',
      url: result.secure_url, // URL of the uploaded file
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});