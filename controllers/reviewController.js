import asyncHandler from '../middleware/asyncHandler.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

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

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingReview) {
    throw new ErrorResponse('Product already reviewed', 400);
  }

  const review = await Review.create({
    rating,
    comment,
    product: productId,
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

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

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new review with transaction
export const createReviewWithTransaction = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse('Product not found', 404);
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });

    if (existingReview) {
      throw new ErrorResponse('Product already reviewed', 400);
    }

    const review = await Review.create([{
      user: userId,
      product: productId,
      rating,
      comment
    }], { session });

    // Update product rating
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]).session(session);

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: stats[0].avgRating,
        reviews: stats[0].numReviews
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

// Remove the default export since we're using named exports