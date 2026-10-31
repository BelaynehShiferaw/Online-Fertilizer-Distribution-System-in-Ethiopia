const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"OFDMS Ethiopia" <notifications@ofdms.gov.et>',
        to,
        subject,
        text,
        html,
      });
      console.log(`[Email Sent] Message to ${to} ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email Error] Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[EMAIL DISPATCH SIMULATOR - NO SMTP CREDS PROVIDED]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: \n${text || html}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }
};

module.exports = { sendEmail };
