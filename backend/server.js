const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { seedInitialData } = require('./utils/seedData');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docuvault';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const docRoutes = require('./routes/docRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'healthy',
    message: 'DocuVault Backend API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send('<h1>DocuVault API Server</h1><p>Server is running. Health check at <a href="/api/health">/api/health</a></p>');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect with auto-retry
let isConnecting = false;
async function connectWithRetry() {
  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;
  console.log('[DocuVault Server] Connecting to database...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✓ Successfully connected to MongoDB!');
    await seedInitialData();
  } catch (err) {
    console.warn('⚠ MongoDB connection failed (Server still running):', err.message);
    console.warn('👉 Retrying connection in 5 seconds...');
    setTimeout(() => {
      isConnecting = false;
      connectWithRetry();
    }, 5000);
  } finally {
    isConnecting = false;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectWithRetry, 5000);
});

// Start listening immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[DocuVault Server] Running on port ${PORT} (http://localhost:${PORT})`);
  connectWithRetry();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`👉 Run the following in PowerShell to free port ${PORT}:`);
    console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = { app, server };
