# Phase 6: Scheduled Reminders, Polish & End-to-End Verification

## Objective
Implement background scheduled reminder services using Nodemailer and `node-cron` (**FR-7**), add in-app reminder alerts, conduct non-functional requirement audits (**NFR-1** to **NFR-8**), and verify overall end-to-end system stability.

---

## 1. Background Reminder Scheduler & Email Service

### Target Files to Create
- `server/src/services/emailService.js`
- `server/src/services/reminderScheduler.js`

### Step 1.1: Nodemailer Service (`server/src/services/emailService.js`)
Configures Nodemailer transporter using SMTP configuration from `process.env`.
- Function `sendTaskReminderEmail(userEmail, task)` sends HTML formatted email notification:
  - Subject: `⏰ Reminder: "${task.title}" is due soon!`
  - Body: Modern HTML email card showing task title, formatted due date, priority level, and link to open dashboard.

### Step 1.2: Scheduled Cron Job (`server/src/services/reminderScheduler.js`)
Initialize recurring `node-cron` job running every 15 minutes (`*/15 * * * *`):
```javascript
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

  // Find pending tasks due within the next hour that haven't received a reminder
  const upcomingTasks = await Task.find({
    status: 'pending',
    reminderSent: false,
    dueDate: { $gte: now, $lte: reminderWindow }
  }).populate('userId');

  for (const task of upcomingTasks) {
    if (task.userId && task.userId.email) {
      await sendTaskReminderEmail(task.userId.email, task);
      task.reminderSent = true;
      await task.save();
    }
  }
});
```

---

## 2. In-App Notifications & Settings Toggle

### Target Files to Create / Modify
- `client/src/components/NotificationBanner.jsx`
- `client/src/pages/Settings.jsx` *(Optional)*

### Features
- In-app toast banner displaying upcoming tasks due within 2 hours upon user login.
- User settings toggle to enable/disable email reminders per user preference.

---

## 3. Polish, Performance & Security Audit

### Performance Check (NFR-1)
- Verify Gemini response parsing completes within 5 seconds.
- Ensure API queries on MongoDB `userId`, `status`, and `dueDate` are properly indexed.

### Security Audit (NFR-2 & NFR-8)
- Verify `process.env.GEMINI_API_KEY` is strictly confined to server-side code and never exposed in React bundle.
- Ensure all task CRUD routes validate `userId` ownership to prevent unprivileged cross-user data access.

### Failure Reliability (NFR-3)
- Simulate network disconnects or API limit errors on Gemini API to confirm the manual task fallback modal functions smoothly without breaking UI state.

---

## 4. Final End-to-End Verification Checklist

- [ ] Register new user account `testuser@example.com`.
- [ ] Create task via Natural Language input: `"Submit final report by tomorrow 10am, high priority"`. Confirm AI preview modal accurately extracts title, priority, and date.
- [ ] Confirm task displays in Dashboard List view with High Priority badge.
- [ ] Switch to Calendar View; confirm task is visible on tomorrow's date grid.
- [ ] Test editing task title and priority from the List View modal.
- [ ] Test marking task as completed and filtering by completed status.
- [ ] Trigger cron job manually or set a test task due in 30 minutes; verify email reminder is received via SMTP.
- [ ] Perform `git status` and verify all code changes are clean and committed.
