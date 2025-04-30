import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { faker } from '@faker-js/faker';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

// Add logging function
const log = (message, data = '') => {
  console.log(`${new Date().toISOString()} - ${message}`, data);
};

const reviewTemplates = [
  { min: 4, max: 5, comments: [
    "Absolutely love this product! Perfect for my baby.",
    "Great quality and worth every penny!",
    "Exactly what we needed. Highly recommend!",
    "Outstanding quality and fast delivery.",
  ]},
  { min: 3, max: 4, comments: [
    "Good product but a bit pricey.",
    "Does the job well, minor improvements needed.",
    "Decent quality, shipping was quick.",
    "Pretty good overall, would buy again.",
  ]},
  { min: 1, max: 3, comments: [
    "Expected better for the price.",
    "Quality could be improved.",
    "Okay but wouldn't buy again.",
    "Delivery was quick but product is average.",
  ]}
];

const seedReviews = async () => {
  try {
    log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // First, verify products exist
    const products = await Product.find().select('_id name');
    log(`Found ${products.length} products`);
    
    if (products.length === 0) {
      throw new Error('No products found in database. Run product seed script first.');
    }

    // Log some product IDs for verification
    log('Sample product IDs:', products.slice(0, 3).map(p => ({ 
      id: p._id.toString(),
      name: p.name
    })));

    await Review.deleteMany({});
    log('Cleared existing reviews');

    const reviews = [];
    const users = Array(20).fill().map(() => new mongoose.Types.ObjectId());

    for (const product of products) {
      const numReviews = Math.floor(Math.random() * 5) + 3;
      const productReviewers = faker.helpers.shuffle([...users]).slice(0, numReviews);
      
      log(`Creating ${numReviews} reviews for product ${product.name} (${product._id})`);
      
      for (const user of productReviewers) {
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        const review = {
          product: product._id,
          user: user,
          rating: Math.floor(Math.random() * (template.max - template.min + 1)) + template.min,
          comment: template.comments[Math.floor(Math.random() * template.comments.length)],
          createdAt: faker.date.between({ 
            from: '2024-01-01', 
            to: new Date() 
          }),
          verifiedPurchase: Math.random() > 0.3,
          helpful: Math.floor(Math.random() * 50)
        };
        reviews.push(review);
      }
    }

    // Insert reviews in batches with better error handling
    const BATCH_SIZE = 50;
    for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
      const batch = reviews.slice(i, i + BATCH_SIZE);
      try {
        await Review.insertMany(batch, { 
          ordered: false,
          timeout: 30000
        });
        log(`Inserted reviews ${i + 1} to ${Math.min(i + BATCH_SIZE, reviews.length)}`);
      } catch (err) {
        if (err.writeErrors) {
          log(`Batch ${i/BATCH_SIZE + 1} had ${err.writeErrors.length} write errors`);
        }
      }
    }

    // Update product ratings with verification
    for (const product of products) {
      const productReviews = reviews.filter(r => r.product.equals(product._id));
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        await Product.findByIdAndUpdate(product._id, {
          rating: Number(avgRating.toFixed(1)),
          reviewCount: productReviews.length
        });
        log(`Updated rating for product ${product.name}: ${avgRating.toFixed(1)} (${productReviews.length} reviews)`);
      }
    }

    log('Finished seeding reviews');
    await mongoose.connection.close();
  } catch (error) {
    log('Error seeding reviews:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedReviews();