const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy DB Connection Middleware for Serverless
let dbPromise = null;
app.use(async (req, res, next) => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  await dbPromise;
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Natural-Language Task Manager API',
  });
});

// Route Modules
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  next(error);
});

// Centralized Error Middleware
app.use(errorHandler);

module.exports = app;
