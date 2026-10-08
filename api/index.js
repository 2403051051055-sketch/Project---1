const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../server/src/config/db');
const errorHandler = require('../server/src/middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[DB Connection Middleware Error]:', err.message);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Natural-Language Task Manager API',
  });
});

app.use('/api/auth', require('../server/src/routes/authRoutes'));
app.use('/api/tasks', require('../server/src/routes/taskRoutes'));

app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  next(error);
});

app.use(errorHandler);

module.exports = app;
