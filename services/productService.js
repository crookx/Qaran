const Product = require('../models/Product');

const productService = {
  getFeaturedProducts: async () => {
    return await Product.find({ isFeatured: true })
      .populate('category')
      .limit(8);
  },

  getProductById: async (id) => {
    return await Product.findById(id)
      .populate('category')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' }
      });
  },

  searchProducts: async (query) => {
    const searchRegex = new RegExp(query, 'i');
    return await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    }).limit(10);
  },

  getProductsByCategory: async (categoryId, filters = {}) => {
    const query = { category: categoryId };
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    return await Product.find(query)
      .populate('category')
      .sort(filters.sort || '-createdAt');
  },

  addReview: async (productId, userId, review) => {
    const product = await Product.findById(productId);
    product.reviews.push({
      user: userId,
      rating: review.rating,
      comment: review.comment,
      date: new Date()
    });
    await product.save();
    return product;
  }
};

module.exports = productService;