const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let cachedTransporter = null;

const createTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Automatic zero-config Ethereal test account fallback
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
};

/**
 * Sends a task due reminder email to user.
 */
const sendTaskReminderEmail = async (userEmail, task) => {
  try {
    const formattedDueDate = task.dueDate
      ? new Date(task.dueDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
      : 'Soon';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; border-radius: 10px;">
        <h2 style="color: #38bdf8;">Task Due Reminder</h2>
        <p>Hello,</p>
        <p>This is a reminder that your task is approaching its due date:</p>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0;">${task.title}</h3>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="text-transform: uppercase;">${task.priority}</span></p>
        </div>
        <p>Please log in to your Task Manager dashboard to view or complete your task.</p>
      </div>
    `;

    // 1. Primary: Use Resend API if RESEND_API_KEY is available (Delivers to real inbox)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const resendResponse = await resend.emails.send({
          from: 'Task Manager AI <onboarding@resend.dev>',
          to: [userEmail],
          subject: `⏰ Task Reminder: "${task.title}" is due soon!`,
          html: htmlContent,
        });

        if (resendResponse && resendResponse.data && resendResponse.data.id) {
          console.log(`[Resend Email Service] Real email delivered to ${userEmail} for task "${task.title}" (ID: ${resendResponse.data.id})`);
          return { success: true, id: resendResponse.data.id, service: 'Resend' };
        }
      } catch (resendError) {
        console.warn(`[Resend Notice] Fallback to Nodemailer:`, resendError.message);
      }
    }

    // 2. Secondary: Fallback to Nodemailer
    const transporter = await createTransporter();
    const senderEmail = process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com'
      ? process.env.SMTP_USER
      : 'noreply@taskmanager.ai';

    const mailOptions = {
      from: `"Task Manager AI" <${senderEmail}>`,
      to: userEmail,
      subject: `⏰ Task Reminder: "${task.title}" is due soon!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[Email Service] Reminder sent to ${userEmail} for task "${task.title}"`);
    if (previewUrl) {
      console.log(`[Email Service Preview URL]: ${previewUrl}`);
    }

    return { success: true, previewUrl, service: 'Nodemailer' };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${userEmail}:`, error.message);
    return false;
  }
};

module.exports = {
  sendTaskReminderEmail,
};
