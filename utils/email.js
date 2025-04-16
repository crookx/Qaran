const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const loadEmailTemplate = async (templateName, replacements) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
  let template = await fs.readFile(templatePath, 'utf-8');
  
  Object.keys(replacements).forEach(key => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  });
  
  return template;
};

const sendEmail = async ({ to, subject, text, html, template, templateData }) => {
  try {
    let htmlContent = html;
    
    if (template) {
      htmlContent = await loadEmailTemplate(template, templateData);
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: htmlContent
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;