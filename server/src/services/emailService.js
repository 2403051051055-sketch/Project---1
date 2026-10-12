const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let cachedTransporter = null;

const createTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

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
const sendTaskReminderEmail = async (userEmail, task, stage = 'minutes_before') => {
  try {
    const formattedDueDate = task.dueDate
      ? new Date(task.dueDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
      : 'Soon';

    let stageBadge = '⏰ Final Reminder';
    let subjectLine = `Task Reminder: "${task.title}" is due soon`;
    let stageDescription = `This is a final reminder that your task is approaching its due date:`;

    if (stage === 'advance') {
      stageBadge = '📅 Advance Notice (Upcoming Task)';
      subjectLine = `Advance Reminder: "${task.title}" is due tomorrow`;
      stageDescription = `Heads-up! You have an upcoming task scheduled for completion:`;
    } else if (stage === 'hours_before') {
      stageBadge = '⏳ Due in a Few Hours';
      subjectLine = `Upcoming Reminder: "${task.title}" is due in a few hours`;
      stageDescription = `Your task is approaching its due deadline in a few hours. Please make sure you are on track:`;
    } else if (stage === 'overdue') {
      stageBadge = '⚠️ Overdue Action Required';
      subjectLine = `Overdue Alert: "${task.title}" is past due`;
      stageDescription = `This task has passed its due date and is still pending in your workspace:`;
    }

    const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b132b; color: #f8fafc; padding: 25px; border-radius: 12px; max-width: 580px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(56, 189, 248, 0.2);">${stageBadge}</span>
          <h2 style="color: #ffffff; margin: 12px 0 0 0; font-size: 20px;">TaskFlow Reminder</h2>
        </div>

        <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 15px 0;">Hello,</p>
        <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 15px 0;">${stageDescription}</p>

        <div style="background: rgba(255,255,255,0.04); padding: 18px; border-left: 4px solid #38bdf8; border-radius: 0 8px 8px 0; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px;">${task.title}</h3>
          <p style="margin: 6px 0; font-size: 13px; color: #cbd5e1;"><strong>Due Date:</strong> <span style="color: #38bdf8;">${formattedDueDate}</span></p>
          <p style="margin: 6px 0; font-size: 13px; color: #cbd5e1;"><strong>Priority:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${task.priority === 'high' ? '#f43f5e' : task.priority === 'medium' ? '#f59e0b' : '#10b981'};">${task.priority}</span></p>
          ${task.labels && task.labels.length > 0 ? `<p style="margin: 6px 0; font-size: 13px; color: #94a3b8;"><strong>Tags:</strong> ${task.labels.map(l => '#' + l).join(' ')}</p>` : ''}
        </div>

        <!-- Call to action: Mark as Completed Notice -->
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 14px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #34d399;">
            ✅ Already finished this task?
          </p>
          <p style="margin: 0; font-size: 12px; color: #a7f3d0; line-height: 1.5;">
            Please open your app and click the <strong>Complete</strong> checkbox on this task so we stop sending further reminder emails!
          </p>
          <div style="margin-top: 12px;">
            <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 6px;">
              Open App & Mark Completed →
            </a>
          </div>
        </div>

        <p style="font-size: 11px; color: #64748b; margin: 20px 0 0 0; text-align: center;">
          Natural-Language Task Manager • Automated Reminder Engine
        </p>
      </div>
    `;

    const plainTextContent = `Hello,\n\n${stageDescription}\n\nTask: ${task.title}\nDue Date: ${formattedDueDate}\nPriority: ${task.priority.toUpperCase()}\n\nALREADY FINISHED THIS TASK?\nPlease open your TaskFlow app (${appUrl}) and mark it as Completed to stop receiving reminder emails!\n\nTaskFlow Automated Reminder Engine`;

    // 1. Primary: Use Gmail / Custom SMTP if configured (Delivers to ANY email address globally)
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'your_email@gmail.com') {
      try {
        const cleanUser = process.env.SMTP_USER.trim();
        const cleanPass = process.env.SMTP_PASS.trim().replace(/\s+/g, '');
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const isGmail = host.toLowerCase().includes('gmail');

        const transporter = nodemailer.createTransport(
          isGmail
            ? {
                service: 'gmail',
                auth: {
                  user: cleanUser,
                  pass: cleanPass,
                },
              }
            : {
                host,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
                auth: {
                  user: cleanUser,
                  pass: cleanPass,
                },
              }
        );

        const mailOptions = {
          from: `"Task Manager" <${cleanUser}>`,
          to: userEmail,
          replyTo: cleanUser,
          subject: subjectLine,
          text: plainTextContent,
          html: htmlContent,
          headers: {
            'X-Priority': '1',
            'Importance': 'high',
          },
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Email Service] Real email delivered to ${userEmail} (ID: ${info.messageId})`);
        return { success: true, id: info.messageId, service: 'SMTP', message: `Real email delivered to ${userEmail} via SMTP` };
      } catch (smtpErr) {
        console.warn('[SMTP Error] Fallback to Resend/Ethereal:', smtpErr.message);
      }
    }

    // 2. Secondary: Brevo API (Sends to any email worldwide without custom domain)
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoSender = process.env.BREVO_SENDER_EMAIL || 'bhavishadabhi08@gmail.com';
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Task Manager AI', email: brevoSender },
            to: [{ email: userEmail }],
            subject: `⏰ Task Reminder: "${task.title}" is due soon!`,
            htmlContent,
          }),
        });

        const brevoData = await response.json();
        if (response.ok && brevoData.messageId) {
          console.log(`[Brevo Email Service] Real email delivered to ${userEmail} (ID: ${brevoData.messageId})`);
          return { success: true, id: brevoData.messageId, service: 'Brevo', message: `Real email delivered to ${userEmail} via Brevo` };
        } else {
          console.warn('[Brevo Error]:', brevoData.message || brevoData);
        }
      } catch (brevoErr) {
        console.warn('[Brevo API Notice]:', brevoErr.message);
      }
    }

    // 3. Tertiary: Resend API (Direct inbox delivery for bhavishadabhi08@gmail.com)
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
          console.log(`[Resend Email Service] Real email delivered to ${userEmail} (ID: ${resendResponse.data.id})`);
          return { success: true, id: resendResponse.data.id, service: 'Resend', message: `Real email delivered to ${userEmail} via Resend` };
        }
        if (resendResponse && resendResponse.error) {
          console.warn(`[Resend API Error]: ${resendResponse.error.message}`);
        }
      } catch (resendError) {
        console.warn(`[Resend Notice] ${resendError.message}`);
      }
    }

    // 3. Fallback: Ethereal test account (for sandbox testing when no real SMTP credentials configured)
    const transporter = await createTransporter();
    const mailOptions = {
      from: `"Task Manager AI" <noreply@taskmanager.ai>`,
      to: userEmail,
      subject: `⏰ Task Reminder: "${task.title}" is due soon!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[Ethereal Email Service] Reminder generated for ${userEmail}. Preview: ${previewUrl}`);
    return {
      success: true,
      previewUrl,
      service: 'Ethereal',
      message: `Email sent (Sandbox mode). To deliver directly to ${userEmail}'s real inbox, set up Gmail SMTP in environment settings.`,
    };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${userEmail}:`, error.message);
    return false;
  }
};

module.exports = {
  sendTaskReminderEmail,
};
