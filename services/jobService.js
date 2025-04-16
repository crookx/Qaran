const Queue = require('bull');
const emailService = require('./emailService');
const LoggerService = require('./loggerService');

const emailQueue = new Queue('email-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

const orderQueue = new Queue('order-queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

emailQueue.process(async (job) => {
  try {
    const { type, data } = job.data;
    switch (type) {
      case 'orderConfirmation':
        await emailService.sendOrderConfirmation(data.order, data.user);
        break;
      case 'passwordReset':
        await emailService.sendPasswordReset(data.user, data.resetToken);
        break;
    }
  } catch (error) {
    LoggerService.error('Email Job Error:', error);
    throw error;
  }
});

orderQueue.process(async (job) => {
  try {
    const { order } = job.data;
    // Process order logic here
    LoggerService.info('Order processed:', { orderId: order._id });
  } catch (error) {
    LoggerService.error('Order Job Error:', error);
    throw error;
  }
});

class JobService {
  static async addEmailJob(type, data) {
    await emailQueue.add({ type, data });
  }

  static async addOrderJob(order) {
    await orderQueue.add({ order });
  }
}

module.exports = JobService;