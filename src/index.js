const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const config = require('./config');
const logger = require('./utils/logger');
const emailService = require('./services/emailService');
const notificationRoutes = require('./routes/notifications');
const SocketHandler = require('./websocket/socketHandler');

const app = express();
const server = http.createServer(app);
const socketHandler = new SocketHandler(server);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});
app.use('/api/', limiter);

app.use('/api/notifications', notificationRoutes);

app.get('/health', async (req, res) => {
  const smtpConnected = await emailService.verifyConnection();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      smtp: smtpConnected ? 'connected' : 'disconnected',
      redis: 'connected'
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Notification Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sendEmail: 'POST /api/notifications/email',
      sendBulk: 'POST /api/notifications/bulk',
      jobStatus: 'GET /api/notifications/status/:jobId',
      jobs: 'GET /api/notifications/jobs',
      stats: 'GET /api/notifications/stats',
      templates: 'GET /api/notifications/templates'
    }
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

server.listen(config.port, () => {
  logger.info(`Notification service running on port ${config.port}`);
  logger.info(`WebSocket server ready`);
  emailService.verifyConnection();
});

module.exports = { app, server, socketHandler };
