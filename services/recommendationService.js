const Product = require('../models/Product');
const Order = require('../models/Order');

class RecommendationService {
  static async getPersonalizedRecommendations(userId) {
    try {
      const userHistory = await Order.find({ user: userId })
        .populate('items.product', 'category');
      
      const categoryScores = {};
      userHistory.forEach(order => {
        order.items.forEach(item => {
          const catId = item.product.category.toString();
          categoryScores[catId] = (categoryScores[catId] || 0) + 1;
        });
      });

      const purchasedProducts = userHistory.flatMap(order => 
        order.items.map(item => item.product._id)
      );

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
            rating: -1
          }
        },
        { $limit: 10 }
      ]);

      return recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  static async getSimilarProducts(productId) {
    try {
      const product = await Product.findById(productId).populate('category');
      if (!product) return [];

      // Price range: ±20% of product price
      const minPrice = product.price * 0.8;
      const maxPrice = product.price * 1.2;

      let similarProducts = await Product.find({
        _id: { $ne: productId },
        $or: [
          { 'category._id': product.category._id },
          { ageGroup: product.ageGroup },
          {
            $and: [
              { price: { $gte: minPrice } },
              { price: { $lte: maxPrice } }
            ]
          }
        ]
      })
      .populate('category')
      .sort({ 
        rating: -1,
        reviews: -1 
      })
      .limit(6);

      // Fallback to category-only search if no results
      if (!similarProducts.length) {
        similarProducts = await Product.find({
          _id: { $ne: productId },
          'category._id': product.category._id
        })
        .populate('category')
        .sort({ rating: -1 })
        .limit(4);
      }

      // Second fallback to price range if still no results
      if (!similarProducts.length) {
        similarProducts = await Product.find({
          _id: { $ne: productId },
          price: { 
            $gte: minPrice,
            $lte: maxPrice 
          }
        })
        .populate('category')
        .sort({ rating: -1 })
        .limit(4);
      }

      return similarProducts;
    } catch (error) {
      console.error('Error getting similar products:', error);
      return [];
    }
  }

  static async getTrendingProducts() {
    try {
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
            category: '$product.category',
            rating: '$product.rating',
            reviews: '$product.reviews',
            totalOrders: 1
          }
        }
      ]);
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }
}

module.exports = RecommendationService;