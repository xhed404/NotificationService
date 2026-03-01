const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const notificationQueue = require('../queues/notificationQueue');
const templateService = require('../services/templateService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');

router.post('/email', validate('sendEmail'), async (req, res) => {
  try {
    const data = req.validatedBody;
    const job = await notificationQueue.addEmail(data, {
      delay: data.delay || 0
    });

    res.status(202).json({
      success: true,
      message: 'Email queued successfully',
      jobId: job.id,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Failed to queue email:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to queue email'
    });
  }
});

router.post('/bulk', validate('sendBulk'), async (req, res) => {
  try {
    const { recipients, template, delay } = req.validatedBody;
    const jobIds = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const job = await notificationQueue.addEmail({
        to: recipient.to,
        template,
        data: recipient.data
      }, {
        delay: delay + (i * 100)
      });
      jobIds.push(job.id);
    }

    res.status(202).json({
      success: true,
      message: `${recipients.length} emails queued`,
      jobIds,
      totalQueued: recipients.length
    });
  } catch (error) {
    logger.error('Failed to queue bulk emails:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to queue bulk emails'
    });
  }
});

router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await notificationQueue.getJobStatus(jobId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Failed to get job status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get job status'
    });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const { status = 'completed', start = 0, end = 100 } = req.query;
    const jobs = await notificationQueue.getJobs(status, parseInt(start), parseInt(end));

    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    logger.error('Failed to get jobs:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get jobs'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await notificationQueue.getQueueStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Failed to get queue stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue stats'
    });
  }
});

router.get('/templates', (req, res) => {
  res.json({
    success: true,
    templates: templateService.listTemplates()
  });
});

router.post('/sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    if (!to || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, body'
      });
    }

    const result = await smsService.sendSMS({ to, body });

    if (result.success) {
      res.status(202).json({
        success: true,
        message: 'SMS sent successfully',
        ...result
      });
    } else {
      res.status(503).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Failed to send SMS:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS'
    });
  }
});

router.get('/sms/status/:messageSid', async (req, res) => {
  try {
    const { messageSid } = req.params;
    const status = await smsService.getMessageStatus(messageSid);
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Failed to get SMS status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get SMS status'
    });
  }
});

module.exports = router;
