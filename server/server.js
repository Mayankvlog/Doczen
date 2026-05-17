const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const envPath = path.join(__dirname, '../.env');
const envResult = dotenv.config({ path: envPath });
if (envResult.error || !process.env.MONGO_URI) {
  const localEnv = path.join(__dirname, '.env');
  dotenv.config({ path: localEnv });
}
if (!process.env.MONGO_URI) {
  console.warn('WARNING: MONGO_URI not found in .env. Create a .env file with MONGO_URI=mongodb+srv://...');
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Periodic cleanup of files older than 24 hours
const cleanupOldFiles = () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  try {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      try {
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > ONE_DAY) {
          fs.unlinkSync(filePath);
        }
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }
};
cleanupOldFiles();
setInterval(cleanupOldFiles, 60 * 60 * 1000);

const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://23.22.249.239',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/history', require('./routes/history'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const clientBuild = path.join(__dirname, '../client/build');
const hasClientBuild = fs.existsSync(path.join(clientBuild, 'index.html'));
if (hasClientBuild) {
  app.use(express.static(clientBuild));
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  if (hasClientBuild) {
    res.sendFile(path.join(clientBuild, 'index.html'));
  } else {
    res.status(200).json({ message: 'Doczen API server is running. Frontend not built yet. Run: cd client && npm run build' });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof URIError) {
    return res.status(400).json({ message: 'Invalid URL encoding' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum size is 50MB' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Unexpected file field. Please check the field name.' });
  }
  if (err.code === 'LIMIT_FIELD_COUNT' || err.code === 'LIMIT_FIELD_KEY' || err.code === 'LIMIT_FIELD_VALUE') {
    return res.status(400).json({ message: 'Too many form fields or invalid form data.' });
  }
  if (err.code === 'LIMIT_PART_COUNT') {
    return res.status(400).json({ message: 'Too many multipart parts.' });
  }
  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Doczen server running on port ${PORT}`);
});

module.exports = app;
