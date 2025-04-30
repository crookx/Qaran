import asyncHandler from '../middleware/asyncHandler.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Get all reviews (admin/testing)
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('product', 'name');

    res.status(200).json({
      status: 'success',
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single review
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name')
      .populate('product', 'name');

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// Create a review
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingReview) {
    throw new ErrorResponse('Product already reviewed', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const review = await Review.create([{
      rating,
      comment,
      product: productId,
      user: req.user._id,
      verifiedPurchase: true
    }], { session });

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]).session(session);

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: Number(stats[0].avgRating.toFixed(1)),
        reviewCount: stats[0].numReviews
      },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      data: review[0]
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Update a review
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return next(new AppError('Review not found or unauthorized', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return next(new AppError('Review not found or unauthorized', 404));
    }

    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews for a specific product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = 'newest', rating = 'all', page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format'
      });
    }

    const query = { product: new mongoose.Types.ObjectId(productId) };
    if (rating !== 'all' && !isNaN(rating)) {
      query.rating = Number(rating);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar');

    const total = await Review.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reviews'
    });
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }

    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      }
    ]);

    const ratingDistribution = stats.length > 0
      ? stats[0].ratings.reduce((acc, rating) => {
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {})
      : {};

    return res.status(200).json({
      status: 'success',
      data: {
        average: stats.length > 0 ? Number(stats[0].avgRating.toFixed(1)) : 0,
        total: stats.length > 0 ? stats[0].numReviews : 0,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error in getReviewStats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mark a review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { helpful: review.helpful }
    });
  } catch (error) {
    console.error('Error in markReviewHelpful:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
