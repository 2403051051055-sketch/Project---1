const cron = require('node-cron');
const Task = require('../models/Task');
const { sendTaskReminderEmail } = require('./emailService');

const initReminderScheduler = () => {
  // Run scheduler every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Reminder Scheduler] Checking for upcoming due tasks...');
    try {
      const now = new Date();
      const reminderWindow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

      const upcomingTasks = await Task.find({
        status: 'pending',
        reminderSent: false,
        dueDate: { $gte: now, $lte: reminderWindow },
      }).populate('userId', 'email name timeZone');

      for (const task of upcomingTasks) {
        if (task.userId && task.userId.email) {
          const sent = await sendTaskReminderEmail(task.userId.email, task);
          if (sent) {
            task.reminderSent = true;
            await task.save();
          }
        }
      }
    } catch (error) {
      console.error('[Reminder Scheduler Error]:', error.message);
    }
  });

  console.log('[Reminder Scheduler] Initialized cron job (runs every 15 minutes).');
};

module.exports = initReminderScheduler;
