const Queue = require('bull');
const config = require('../config');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const templateService = require('../services/templateService');

const notificationQueue = new Queue('notifications', config.redis.url, {
  defaultJobOptions: {
    attempts: config.retry.maxRetries,
    backoff: {
      type: 'exponential',
      delay: config.retry.delayMs
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

notificationQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed`, { result });
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

notificationQueue.process('email', async (job) => {
  const { to, template, data, subject, html, text, from } = job.data;
  
  let emailContent;
  
  if (template) {
    emailContent = templateService.render(template, data);
  } else {
    emailContent = { subject, html, text };
  }
  
  const result = await emailService.sendEmail({
    to,
    from,
    ...emailContent
  });
  
  return result;
});

notificationQueue.process('sms', async (job) => {
  logger.info('SMS processing not implemented yet', { jobId: job.id });
  return { success: true, message: 'SMS queued for future implementation' };
});

notificationQueue.process('push', async (job) => {
  logger.info('Push notification processing not implemented yet', { jobId: job.id });
  return { success: true, message: 'Push notification queued for future implementation' };
});

class NotificationQueue {
  async addEmail(data, options = {}) {
    const job = await notificationQueue.add('email', data, options);
    logger.info(`Email job added: ${job.id}`);
    return job;
  }

  async addSMS(data, options = {}) {
    const job = await notificationQueue.add('sms', data, options);
    logger.info(`SMS job added: ${job.id}`);
    return job;
  }

  async addPush(data, options = {}) {
    const job = await notificationQueue.add('push', data, options);
    logger.info(`Push job added: ${job.id}`);
    return job;
  }

  async getJobStatus(jobId) {
    const job = await notificationQueue.getJob(jobId);
    if (!job) return null;
    
    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };
  }

  async getJobs(status = 'completed', start = 0, end = 100) {
    let jobs;
    switch (status) {
      case 'completed':
        jobs = await notificationQueue.getCompleted(start, end);
        break;
      case 'failed':
        jobs = await notificationQueue.getFailed(start, end);
        break;
      case 'waiting':
        jobs = await notificationQueue.getWaiting(start, end);
        break;
      case 'active':
        jobs = await notificationQueue.getActive(start, end);
        break;
      case 'delayed':
        jobs = await notificationQueue.getDelayed(start, end);
        break;
      default:
        jobs = await notificationQueue.getJobs([status], start, end);
    }
    
    return Promise.all(jobs.map(async (job) => ({
      id: job.id,
      state: await job.getState(),
      data: job.data,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    })));
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      notificationQueue.getWaitingCount(),
      notificationQueue.getActiveCount(),
      notificationQueue.getCompletedCount(),
      notificationQueue.getFailedCount(),
      notificationQueue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  getQueue() {
    return notificationQueue;
  }
}

module.exports = new NotificationQueue();