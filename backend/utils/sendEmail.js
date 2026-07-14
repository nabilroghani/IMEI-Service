const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configurations are not fully set, fallback to console log
  const useRealSMTP = 
    process.env.EMAIL_HOST && 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'your_smtp_user';

  if (!useRealSMTP) {
    console.log('========================================================');
    console.log('EMAIL NOTIFICATION (CONSOLE FALLBACK):');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.text}`);
    console.log('========================================================');
    return;
  }

  const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 2525;

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailPort === 465, // true for 465 SSL, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Define message options
  const message = {
    from: `${process.env.EMAIL_FROM_NAME || 'IMEI Unlock Portal'} <${process.env.EMAIL_FROM || 'noreply@imeiunlockservice.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log(`Email dispatched successfully: ${info.messageId}`);
};

module.exports = sendEmail;
