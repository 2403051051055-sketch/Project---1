const cron = require('node-cron');
const Task = require('../models/Task');
const { sendTaskReminderEmail } = require('./emailService');

const initReminderScheduler = () => {
  // Run scheduler every 30 seconds for high-precision real-time multi-stage email reminders
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const now = new Date();

      // Look for pending tasks with a valid due date
      const pendingTasks = await Task.find({
        status: 'pending',
        dueDate: { $ne: null },
      }).populate('userId', 'email name timeZone');

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
          // Stage: minutes_before (30 minutes to due time)
          if (!sentStages.has('minutes_before')) {
            stageToSend = 'minutes_before';
          }
        } else if (diffHours <= 3 && diffMins > 30) {
          // Stage: hours_before (30 mins to 3 hours before due time)
          if (!sentStages.has('hours_before')) {
            stageToSend = 'hours_before';
          }
        } else if (diffHours <= 24 && diffHours > 3) {
          // Stage: advance (3 hours to 24 hours / tomorrow heads up)
          if (!sentStages.has('advance')) {
            stageToSend = 'advance';
          }
        } else if (diffMins < 0) {
          // Stage: overdue (passed deadline, follow up until completed)
          const lastSentTime = task.lastReminderSentAt ? new Date(task.lastReminderSentAt).getTime() : 0;
          const twelveHoursMs = 12 * 60 * 60 * 1000;
          if (!sentStages.has('overdue') || (now.getTime() - lastSentTime >= twelveHoursMs)) {
            stageToSend = 'overdue';
          }
        }

        if (stageToSend) {
          console.log(`[Multi-Stage Scheduler] Auto-dispatching "${stageToSend}" reminder for task "${task.title}" to ${targetEmail}`);
          const sent = await sendTaskReminderEmail(targetEmail, task, stageToSend);
          if (sent && sent.success) {
            task.reminderSent = true;
            task.lastReminderSentAt = now;
            if (!task.remindersSent) task.remindersSent = [];
            task.remindersSent.push({ stage: stageToSend, sentAt: now });
            await task.save();
          }
        }
      }
    } catch (error) {
      console.error('[Reminder Scheduler Error]:', error.message);
    }
  });

  console.log('[Reminder Scheduler] Initialized 30-second multi-stage precision cron engine.');
};

module.exports = initReminderScheduler;
