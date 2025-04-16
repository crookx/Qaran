import EmailTemplates from 'email-templates';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const email = new EmailTemplates({
  message: {
    from: process.env.EMAIL_FROM
  },
  transport: transporter,
  views: {
    root: path.join(__dirname, '../views/emails'),
    options: {
      extension: 'ejs'
    }
  }
});

export const sendEmail = async (template, { to, subject, locals }) => {
  try {
    await email.send({
      template,
      message: {
        to,
        subject
      },
      locals
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export default email;