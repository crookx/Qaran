import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Question from '../models/Question.js';
import Category from '../models/Category.js';

// Setup proper path for .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define URIs with fallbacks
const LOCAL_URI = 'mongodb://localhost:27017/qaran_db';
const ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://qaranuser:iPyjRkJyr3gaAsX3@qaran-baby-shop.ed8u0jn.mongodb.net/qaran';

const migrateToAtlas = async () => {
  try {
    // Verify URIs before connecting
    console.log('Local URI:', LOCAL_URI);
    console.log('Atlas URI:', ATLAS_URI.replace(/\/\/[^:]+:[^@]+@/, '//*:*@')); // Hide credentials in logs

    if (!ATLAS_URI) {
      throw new Error('MongoDB Atlas URI is not defined. Please check your .env file');
    }

    // Connect to both databases
    const localConn = await mongoose.createConnection(LOCAL_URI);
    console.log('Connected to local database');
    
    const atlasConn = await mongoose.createConnection(ATLAS_URI);
    console.log('Connected to Atlas database');

    // Create models for both connections
    const LocalProduct = localConn.model('Product', Product.schema);
    const LocalReview = localConn.model('Review', Review.schema);
    const LocalQuestion = localConn.model('Question', Question.schema);
    const LocalCategory = localConn.model('Category', Category.schema);

    const AtlasProduct = atlasConn.model('Product', Product.schema);
    const AtlasReview = atlasConn.model('Review', Review.schema);
    const AtlasQuestion = atlasConn.model('Question', Question.schema);
    const AtlasCategory = atlasConn.model('Category', Category.schema);

    // Fetch all data from local
    const products = await LocalProduct.find({}).lean();
    const reviews = await LocalReview.find({}).lean();
    const questions = await LocalQuestion.find({}).lean();
    const categories = await LocalCategory.find({}).lean();

    console.log(`Found ${products.length} products, ${reviews.length} reviews, ${questions.length} questions locally`);

    // Clear existing data in Atlas (optional - be careful!)
    await AtlasProduct.deleteMany({});
    await AtlasReview.deleteMany({});
    await AtlasQuestion.deleteMany({});
    await AtlasCategory.deleteMany({});

    // Insert categories first (since products depend on them)
    await AtlasCategory.insertMany(categories);
    console.log('Categories migrated successfully');

    // Insert products with proper references
    await AtlasProduct.insertMany(products);
    console.log('Products migrated successfully');

    // Insert reviews and questions
    await AtlasReview.insertMany(reviews);
    console.log('Reviews migrated successfully');
    
    await AtlasQuestion.insertMany(questions);
    console.log('Questions migrated successfully');

    console.log('Migration completed successfully!');

    // Close connections
    await localConn.close();
    await atlasConn.close();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateToAtlas();