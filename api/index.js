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

// Vercel Cron Job Endpoint for multi-stage automatic email reminders
app.get('/api/cron/reminders', async (req, res) => {
  try {
    const Task = require('../server/src/models/Task');
    const { sendTaskReminderEmail } = require('../server/src/services/emailService');
    const now = new Date();

    const pendingTasks = await Task.find({
      status: 'pending',
      dueDate: { $ne: null },
    }).populate('userId', 'email name timeZone');

    let processedCount = 0;
    for (const task of pendingTasks) {
      const targetEmail = task.userId?.email;
      if (!targetEmail) continue;

      const dueTime = new Date(task.dueDate).getTime();
      const diffMs = dueTime - now.getTime();
      const diffMins = diffMs / (60 * 1000);
      const diffHours = diffMs / (60 * 60 * 1000);

      const sentStages = new Set((task.remindersSent || []).map(r => r.stage));
      let stageToSend = null;

      if (diffMins <= 30 && diffMins >= 0) {
        if (!sentStages.has('minutes_before')) stageToSend = 'minutes_before';
      } else if (diffHours <= 3 && diffMins > 30) {
        if (!sentStages.has('hours_before')) stageToSend = 'hours_before';
      } else if (diffHours <= 24 && diffHours > 3) {
        if (!sentStages.has('advance')) stageToSend = 'advance';
      } else if (diffMins < 0) {
        const lastSentTime = task.lastReminderSentAt ? new Date(task.lastReminderSentAt).getTime() : 0;
        const twelveHoursMs = 12 * 60 * 60 * 1000;
        if (!sentStages.has('overdue') || (now.getTime() - lastSentTime >= twelveHoursMs)) {
          stageToSend = 'overdue';
        }
      }

      if (stageToSend) {
        const sent = await sendTaskReminderEmail(targetEmail, task, stageToSend);
        if (sent && sent.success) {
          task.reminderSent = true;
          task.lastReminderSentAt = now;
          if (!task.remindersSent) task.remindersSent = [];
          task.remindersSent.push({ stage: stageToSend, sentAt: now });
          await task.save();
          processedCount++;
        }
      }
    }

    res.json({
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Vercel Cron Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
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
