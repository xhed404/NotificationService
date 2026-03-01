const { Server } = require('socket.io');
const logger = require('../utils/logger');
const notificationQueue = require('../queues/notificationQueue');

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
    this.setupQueueListeners();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('subscribe:job', (jobId) => {
        socket.join(`job:${jobId}`);
        logger.info(`Client ${socket.id} subscribed to job ${jobId}`);
        socket.emit('subscribed', { jobId });
      });

      socket.on('unsubscribe:job', (jobId) => {
        socket.leave(`job:${jobId}`);
        logger.info(`Client ${socket.id} unsubscribed from job ${jobId}`);
      });

      socket.on('subscribe:stats', () => {
        socket.join('stats');
        logger.info(`Client ${socket.id} subscribed to stats`);
        this.emitStats();
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  setupQueueListeners() {
    const queue = notificationQueue.getQueue();

    queue.on('completed', (job, result) => {
      this.io.to(`job:${job.id}`).emit('job:completed', {
        jobId: job.id,
        result,
        timestamp: new Date().toISOString()
      });
      this.emitStats();
    });

    queue.on('failed', (job, err) => {
      this.io.to(`job:${job.id}`).emit('job:failed', {
        jobId: job.id,
        error: err.message,
        attemptsMade: job.attemptsMade,
        timestamp: new Date().toISOString()
      });
      this.emitStats();
    });

    queue.on('progress', (job, progress) => {
      this.io.to(`job:${job.id}`).emit('job:progress', {
        jobId: job.id,
        progress,
        timestamp: new Date().toISOString()
      });
    });

    queue.on('stalled', (job) => {
      this.io.to(`job:${job.id}`).emit('job:stalled', {
        jobId: job.id,
        timestamp: new Date().toISOString()
      });
    });
  }

  async emitStats() {
    const stats = await notificationQueue.getQueueStats();
    this.io.to('stats').emit('stats:update', {
      ...stats,
      timestamp: new Date().toISOString()
    });
  }

  emitNewJob(job) {
    this.io.emit('job:created', {
      jobId: job.id,
      type: job.name,
      timestamp: new Date().toISOString()
    });
    this.emitStats();
  }
}

module.exports = SocketHandler;
