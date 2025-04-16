const Product = require('../models/Product');
const Order = require('../models/Order');

class RecommendationService {
  static async getPersonalizedRecommendations(userId) {
    // Get user's purchase and rating history
    const userHistory = await Order.find({ user: userId })
      .populate('items.product', 'category');
    
    // Extract category preferences
    const categoryScores = {};
    userHistory.forEach(order => {
      order.items.forEach(item => {
        const catId = item.product.category.toString();
        categoryScores[catId] = (categoryScores[catId] || 0) + 1;
      });
    });

    // Get purchased product IDs
    const purchasedProducts = userHistory.flatMap(order => 
      order.items.map(item => item.product._id)
    );

    // Find similar products based on categories
    const recommendations = await Product.aggregate([
      {
        $match: {
          _id: { $nin: purchasedProducts },
          category: { $in: Object.keys(categoryScores) }
        }
      },
      {
        $addFields: {
          categoryScore: {
            $let: {
              vars: {
                catScore: { 
                  $toString: '$category'
                }
              },
              in: { 
                $ifNull: [
                  { $arrayElemAt: [Object.values(categoryScores), 0] },
                  0
                ]
              }
            }
          }
        }
      },
      {
        $sort: {
          categoryScore: -1,
          averageRating: -1
        }
      },
      { $limit: 10 }
    ]);

    return recommendations;
  }

  static async getSimilarProducts(productId) {
    const product = await Product.findById(productId);
    if (!product) return [];

    return await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } }
      ]
    })
    .sort({ averageRating: -1 })
    .limit(6);
  }

  static async getTrendingProducts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          'paymentInfo.status': 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          price: '$product.price',
          images: '$product.images',
          totalOrders: 1
        }
      }
    ]);
  }
}

module.exports = RecommendationService;