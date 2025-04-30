import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { faker } from '@faker-js/faker';
import connectDB from '../utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const reviewTemplates = [
  {
    rating: 5,
    comments: [
      "Absolutely love this product! Perfect for our baby.",
      "Outstanding quality, highly recommend!",
      "Best purchase we've made for our little one.",
      "Excellent product, exceeded expectations!",
      "Top-notch quality and fast delivery."
    ]
  },
  {
    rating: 4,
    comments: [
      "Very good product, minor improvements possible.",
      "Great value for money, would buy again.",
      "Really pleased with the quality.",
      "Good product, just missing a few features.",
      "Nice quality, shipping was quick."
    ]
  },
  {
    rating: 3,
    comments: [
      "Decent product but a bit pricey.",
      "Does the job but could be better.",
      "Average quality, meets basic needs.",
      "Fair product, room for improvement.",
      "Okay quality, expected more features."
    ]
  },
  {
    rating: 2,
    comments: [
      "Below average quality for the price.",
      "Not very durable, disappointed.",
      "Several issues with the product.",
      "Wouldn't recommend at this price."
    ]
  },
  {
    rating: 1,
    comments: [
      "Poor quality product.",
      "Not worth the money.",
      "Had issues right from the start.",
      "Very disappointed with the purchase."
    ]
  }
];

const createReviewsForProduct = async (product, testUsers) => {
  try {
    // First, check if product already has reviews
    const existingReviews = await Review.find({ product: product._id });
    if (existingReviews.length > 0) {
      console.log(`Skipping ${product.name} - already has ${existingReviews.length} reviews`);
      return existingReviews;
    }

    const reviewCount = Math.floor(Math.random() * 8) + 5; // 5-12 reviews per product
    const reviews = [];
    const usedUsers = new Set();

    // Distribution weights for ratings (favoring positive reviews)
    const ratingWeights = [0.1, 0.1, 0.2, 0.3, 0.3]; // 1-5 stars respectively

    for (let i = 0; i < reviewCount; i++) {
      let user;
      do {
        user = testUsers[Math.floor(Math.random() * testUsers.length)];
      } while (usedUsers.has(user.toString()));
      
      usedUsers.add(user.toString());

      // Select rating based on weights
      const random = Math.random();
      let rating = 5;
      let cumulative = 0;
      for (let j = 0; j < ratingWeights.length; j++) {
        cumulative += ratingWeights[j];
        if (random <= cumulative) {
          rating = j + 1;
          break;
        }
      }

      const template = reviewTemplates.find(t => t.rating === rating);
      const review = new Review({
        product: product._id,
        user: user,
        rating: rating,
        comment: template.comments[Math.floor(Math.random() * template.comments.length)],
        verifiedPurchase: Math.random() > 0.15, // 85% verified purchases
        helpful: Math.floor(Math.random() * 50), // 0-49 helpful votes
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
      });

      try {
        const savedReview = await review.save();
        reviews.push(savedReview);
        console.log(`Created review for ${product.name} (${rating} stars)`);
      } catch (err) {
        console.error(`Error creating review for ${product.name}:`, err.message);
      }
    }

    return reviews;
  } catch (error) {
    console.error(`Error in createReviewsForProduct for ${product.name}:`, error);
    return [];
  }
};

const updateProductRating = async (product, reviews) => {
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product._id, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length
    });
    console.log(`Updated ${product.name} rating to ${avgRating.toFixed(1)} (${reviews.length} reviews)`);
  }
};

const linkReviews = async () => {
  try {
    console.log('Initializing database connection...');
    await connectDB(MONGODB_URI);
    
    // Get all products
    const products = await Product.find({});
    if (!products.length) {
      throw new Error('No products found in database');
    }
    console.log(`Found ${products.length} products`);

    // Create test users
    const testUsers = Array(20).fill().map(() => new mongoose.Types.ObjectId());
    console.log('Created test user IDs');

    // Create reviews for each product
    for (const product of products) {
      const reviews = await createReviewsForProduct(product, testUsers);
      await updateProductRating(product, reviews);
    }

    console.log('Successfully linked all reviews!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Script error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

linkReviews();