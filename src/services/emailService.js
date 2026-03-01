const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
      return true;
    } catch (error) {
      logger.error('SMTP connection failed:', error.message);
      return false;
    }
  }

  async sendEmail({ to, subject, html, text, from, attachments = [] }) {
    try {
      const mailOptions = {
        from: from || `"Notification Service" <${config.smtp.user}>`,
        to,
        subject,
        html,
        text,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();
