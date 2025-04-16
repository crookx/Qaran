const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(userId, data) {
    return await Notification.create({
      user: userId,
      ...data
    });
  }

  async createOrderNotification(userId, orderId, status) {
    const notifications = {
      pending: {
        title: 'Order Placed',
        message: `Your order #${orderId} has been placed successfully.`
      },
      processing: {
        title: 'Order Processing',
        message: `Your order #${orderId} is being processed.`
      },
      shipped: {
        title: 'Order Shipped',
        message: `Your order #${orderId} has been shipped.`
      },
      delivered: {
        title: 'Order Delivered',
        message: `Your order #${orderId} has been delivered.`
      },
      cancelled: {
        title: 'Order Cancelled',
        message: `Your order #${orderId} has been cancelled.`
      }
    };

    const notification = notifications[status];
    if (notification) {
      return await this.createNotification(userId, {
        ...notification,
        type: 'order',
        link: `/orders/${orderId}`,
        metadata: { orderId, status }
      });
    }
  }
}

module.exports = new NotificationService();