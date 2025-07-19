const nodemailer = require("nodemailer");

// Create a reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Gmail's SMTP server
  port: parseInt(process.env.EMAIL_PORT, 10), // Typically 465 for SSL
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER, // Gmail address (e.g., notelymusictuition@gmail.com)
    pass: process.env.EMAIL_PASS, // App-specific password
  },
});

/**
 * Send an email using the configured transporter.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Subject line of the email.
 * @param {string} options.html - HTML content of the email.
 */
async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender name and email (e.g., "Notely <notelymusictuition@gmail.com>")
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = sendEmail;