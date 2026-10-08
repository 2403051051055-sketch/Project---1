const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Global Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Natural-Language Task Manager API',
  });
});

// Route Modules
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  next(error);
});

// Centralized Error Middleware
app.use(errorHandler);

const startServer = async () => {
  // Connect to MongoDB database
  await connectDB();

  // Initialize background reminder scheduler
  const initReminderScheduler = require('./services/reminderScheduler');
  initReminderScheduler();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Server] Natural-Language Task Manager backend running on port ${PORT}`);
  });
};

startServer();
