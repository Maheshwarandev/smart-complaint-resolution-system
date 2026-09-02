const nodemailer = require('nodemailer');

// Initialize Transporter
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development / Preview mode logger
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('📧 [EMAIL PREVIEW (No SMTP configured)]');
        console.log(`   To: ${mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }

  return transporter;
};

// Generic mail sender
const sendMail = async ({ to, subject, html }) => {
  try {
    const transport = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"SCRS Enterprise Desk" <support@scrs.com>';
    
    return await transport.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`❌ Email delivery failed to ${to}:`, error.message);
    return null;
  }
};

// Base HTML Wrapper
const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060911; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #0d1320; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 800; color: #38bdf8; letter-spacing: -0.02em; }
    .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 12px; }
    .content { font-size: 15px; line-height: 1.6; color: #94a3b8; }
    .card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; margin: 20px 0; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; }
    .meta-val { color: #f8fafc; font-weight: 700; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; margin-top: 20px; text-align: center; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">🛡️ SCRS ENTERPRISE</div>
      <div class="title">${title}</div>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      This is an automated notification from the SCRS Enterprise Support Desk.
    </div>
  </div>
</body>
</html>
`;

// 1. Complaint Created
const sendTicketCreatedEmail = async (user, complaint) => {
  if (!user || !user.email) return;

  const html = emailWrapper(
    'Service Ticket Received',
    `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your service ticket has been successfully registered in the system. Our support team is actively working on it.</p>
      <div class="card">
        <div class="meta-row"><span class="meta-label">Ticket Title:</span> <span class="meta-val">${complaint.title}</span></div>
        <div class="meta-row"><span class="meta-label">Category:</span> <span class="meta-val">${complaint.category}</span></div>
        <div class="meta-row"><span class="meta-label">Priority:</span> <span class="meta-val">${complaint.priority.toUpperCase()}</span></div>
        <div class="meta-row"><span class="meta-label">SLA Resolution Target:</span> <span class="meta-val">${complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : 'Standard'}</span></div>
      </div>
      <p>You can track updates and message support engineers in your dashboard.</p>
    `
  );

  return sendMail({
    to: user.email,
    subject: `[SCRS Ticket #${complaint._id.toString().slice(-6)}] ${complaint.title}`,
    html,
  });
};

// 2. Complaint Assigned to Agent
const sendTicketAssignedEmail = async (agent, complaint, user) => {
  if (!agent || !agent.email) return;

  const html = emailWrapper(
    'New Ticket Assigned to You',
    `
      <p>Hello <strong>${agent.name}</strong>,</p>
      <p>A support complaint has been assigned to your queue for investigation and resolution.</p>
      <div class="card">
        <div class="meta-row"><span class="meta-label">Ticket ID:</span> <span class="meta-val">#${complaint._id.toString().slice(-6)}</span></div>
        <div class="meta-row"><span class="meta-label">Title:</span> <span class="meta-val">${complaint.title}</span></div>
        <div class="meta-row"><span class="meta-label">Complainant:</span> <span class="meta-val">${user?.name || 'User'} (${user?.email || 'N/A'})</span></div>
        <div class="meta-row"><span class="meta-label">Priority:</span> <span class="meta-val" style="color:#ef4444;">${complaint.priority.toUpperCase()}</span></div>
        <div class="meta-row"><span class="meta-label">SLA Deadline:</span> <span class="meta-val">${complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : 'N/A'}</span></div>
      </div>
      <p><strong>Description:</strong> ${complaint.description}</p>
    `
  );

  return sendMail({
    to: agent.email,
    subject: `[Ticket Assigned] #${complaint._id.toString().slice(-6)}: ${complaint.title}`,
    html,
  });
};

// 3. Status Change / Resolution
const sendTicketStatusUpdatedEmail = async (user, complaint) => {
  if (!user || !user.email) return;

  const isResolved = complaint.status === 'Resolved';
  const html = emailWrapper(
    `Ticket Status: ${complaint.status}`,
    `
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your support ticket has been updated to <strong>${complaint.status}</strong>.</p>
      <div class="card">
        <div class="meta-row"><span class="meta-label">Ticket:</span> <span class="meta-val">${complaint.title}</span></div>
        <div class="meta-row"><span class="meta-label">Current Status:</span> <span class="meta-val">${complaint.status}</span></div>
        ${complaint.resolutionNote ? `<div class="meta-row"><span class="meta-label">Resolution Notes:</span> <span class="meta-val">${complaint.resolutionNote}</span></div>` : ''}
      </div>
      ${isResolved ? `<p>⭐ Please sign in to your dashboard to rate your resolution experience!</p>` : ''}
    `
  );

  return sendMail({
    to: user.email,
    subject: `[Status: ${complaint.status}] Ticket #${complaint._id.toString().slice(-6)}`,
    html,
  });
};

// 4. New Comment in Thread
const sendNewCommentEmail = async (recipient, sender, complaint, commentText) => {
  if (!recipient || !recipient.email) return;

  const html = emailWrapper(
    'New Message on Ticket',
    `
      <p>Hello <strong>${recipient.name}</strong>,</p>
      <p><strong>${sender.name}</strong> (${sender.role}) posted a message on Ticket #${complaint._id.toString().slice(-6)}: <em>"${complaint.title}"</em></p>
      <div class="card">
        <p style="margin: 0; font-style: italic; color: #f8fafc;">"${commentText}"</p>
      </div>
      <p>Sign in to your portal to reply directly to the discussion thread.</p>
    `
  );

  return sendMail({
    to: recipient.email,
    subject: `[New Reply] Ticket #${complaint._id.toString().slice(-6)}: ${complaint.title}`,
    html,
  });
};

module.exports = {
  sendTicketCreatedEmail,
  sendTicketAssignedEmail,
  sendTicketStatusUpdatedEmail,
  sendNewCommentEmail,
};
