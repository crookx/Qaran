import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Question from '../models/Question.js';

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/qaran_db';
const ATLAS_URI = process.env.MONGODB_URI; // Your Atlas connection string

async function migrateData() {
  try {
    // Connect to local DB
    const localConnection = await mongoose.createConnection(LOCAL_URI);
    console.log('Connected to local database');

    // Connect to Atlas
    const atlasConnection = await mongoose.createConnection(ATLAS_URI);
    console.log('Connected to Atlas database');

    // Get models for both connections
    const LocalProduct = localConnection.model('Product', Product.schema);
    const LocalReview = localConnection.model('Review', Review.schema);
    const LocalQuestion = localConnection.model('Question', Question.schema);

    const AtlasProduct = atlasConnection.model('Product', Product.schema);
    const AtlasReview = atlasConnection.model('Review', Review.schema);
    const AtlasQuestion = atlasConnection.model('Question', Question.schema);

    // Fetch all data from local
    const products = await LocalProduct.find({});
    const reviews = await LocalReview.find({});
    const questions = await LocalQuestion.find({});

    console.log(`Found ${products.length} products, ${reviews.length} reviews, ${questions.length} questions locally`);

    // Clear existing data in Atlas (optional - be careful!)
    await AtlasProduct.deleteMany({});
    await AtlasReview.deleteMany({});
    await AtlasQuestion.deleteMany({});

    // Insert data into Atlas
    await AtlasProduct.insertMany(products);
    await AtlasReview.insertMany(reviews);
    await AtlasQuestion.insertMany(questions);

    console.log('Migration completed successfully!');

    // Close connections
    await localConnection.close();
    await atlasConnection.close();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();