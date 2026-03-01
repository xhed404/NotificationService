const twilio = require('twilio');
const config = require('../config');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    if (config.twilio?.accountSid && config.twilio?.authToken) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
      this.fromNumber = config.twilio.fromNumber;
      this.enabled = true;
    } else {
      this.enabled = false;
      logger.warn('Twilio not configured. SMS service disabled.');
    }
  }

  async sendSMS({ to, body }) {
    if (!this.enabled) {
      logger.warn('SMS service is disabled. Message not sent:', { to, body });
      return {
        success: false,
        error: 'SMS service not configured',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to
      });

      logger.info(`SMS sent successfully to ${to}`, { messageSid: message.sid });

      return {
        success: true,
        messageSid: message.sid,
        status: message.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error.message);
      throw error;
    }
  }

  async getMessageStatus(messageSid) {
    if (!this.enabled) {
      return { error: 'SMS service not configured' };
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        messageSid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateSent: message.dateSent,
        price: message.price
      };
    } catch (error) {
      logger.error('Failed to get message status:', error.message);
      throw error;
    }
  }
}

module.exports = new SMSService();
