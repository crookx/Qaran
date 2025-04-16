const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

class AnalyticsService {
  static async getSalesAnalytics(startDate, endDate) {
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'paymentInfo.status': 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return salesData;
  }

  static async getProductPerformance() {
    return await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orderData'
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          totalSales: { $size: '$orderData' },
          revenue: {
            $reduce: {
              input: '$orderData',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.total'] }
            }
          }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
  }

  static async getCustomerMetrics() {
    const customerData = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $reduce: {
              input: '$orders',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.total'] }
            }
          },
          averageOrderValue: {
            $avg: '$orders.total'
          }
        }
      }
    ]);

    return customerData;
  }

  static async getInventoryAnalytics() {
    return await Product.aggregate([
      {
        $project: {
          name: 1,
          stock: 1,
          stockValue: { $multiply: ['$stock', '$price'] },
          lowStock: { $lte: ['$stock', 10] }
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: '$stockValue' },
          lowStockItems: {
            $sum: { $cond: ['$lowStock', 1, 0] }
          }
        }
      }
    ]);
  }
}

module.exports = AnalyticsService;