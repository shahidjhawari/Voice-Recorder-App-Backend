const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://shahidjhawari:shahidjhawari@cluster0.ka56m.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database connection event listeners
const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

// Define a schema for the audio files
const audioSchema = new mongoose.Schema({
  filename: String,
  path: String,
  createdAt: { type: Date, default: Date.now },
});

// Create a model for the audio files
const Audio = mongoose.model('Audio', audioSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route to handle file uploads
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Save file details to MongoDB
    const audio = new Audio({
      filename: req.file.originalname,
      path: req.file.path,
    });

    await audio.save();

    res.status(200).json({ message: 'File uploaded successfully.', file: req.file });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
});

// Route to fetch all uploaded audio files
app.get('/audios', async (req, res) => {
  try {
    const audios = await Audio.find().sort({ createdAt: -1 });
    res.status(200).json(audios);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    res.status(500).json({ message: 'Failed to fetch audio files.' });
  }
});

// Route to serve uploaded audio files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found.' });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Audio Server!");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});