import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

export const getSalesAnalytics = async (req, res, next) => {
    try {
        const { period = '7days' } = req.query;
        
        const dateRange = {
            '7days': 7,
            '30days': 30,
            '12months': 365
        };

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dateRange[period]);

        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({
            status: 'success',
            data: { salesData }
        });
    } catch (error) {
        next(error);
    }
};

export const getProductAnalytics = async (req, res, next) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalSold: { $sum: '$products.quantity' },
                    revenue: { 
                        $sum: { 
                            $multiply: ['$products.price', '$products.quantity'] 
                        }
                    }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }
        ]);

        res.status(200).json({
            status: 'success',
            data: { topProducts }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserAnalytics = async (req, res, next) => {
    try {
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: '%Y-%m', 
                            date: '$createdAt' 
                        }
                    },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const customerSegments = await Order.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $bucket: {
                    groupBy: '$totalSpent',
                    boundaries: [0, 100, 500, 1000, Infinity],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                        avgOrders: { $avg: '$orderCount' }
                    }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: { userStats, customerSegments }
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderAnalytics = async (req, res, next) => {
    try {
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const avgOrderValue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    avgValue: { $avg: '$totalAmount' },
                    avgItems: { $avg: { $size: '$products' } }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: { orderStats, avgOrderValue: avgOrderValue[0] }
        });
    } catch (error) {
        next(error);
    }
};