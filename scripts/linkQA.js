import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Question from '../models/Question.js';
import connectDB from '../utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const questionTemplates = [
  "What age is this suitable for?",
  "Does it come in different colors?",
  "How long does shipping usually take?",
  "Is this machine washable?",
  "What are the dimensions?",
  "Is this product durable?",
  "Does it come with a warranty?",
  "Is it easy to clean?",
  "What material is it made of?",
  "Can you use this for multiple children?"
];

const answerTemplates = [
  "Based on my experience, {answer}",
  "Yes, {answer}",
  "No, {answer}",
  "According to the manufacturer, {answer}",
  "From what I know, {answer}"
];

const detailedAnswers = [
  "it's perfect for babies 6-12 months old.",
  "it comes in blue, pink, and yellow options.",
  "shipping typically takes 3-5 business days.",
  "you can machine wash it on gentle cycle.",
  "the product measures 12x15x20 inches.",
  "it's very sturdy and lasts a long time.",
  "it includes a 1-year manufacturer warranty.",
  "just wipe with a damp cloth to clean.",
  "it's made from high-quality, child-safe materials.",
  "it's designed for single child use only."
];

const createQAForProduct = async (product, testUsers) => {
  const questionCount = Math.floor(Math.random() * 5) + 3; // 3-7 questions per product
  const questions = [];
  const usedQuestions = new Set();

  for (let i = 0; i < questionCount; i++) {
    let questionTemplate;
    do {
      questionTemplate = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    } while (usedQuestions.has(questionTemplate));
    
    usedQuestions.add(questionTemplate);

    const answerCount = Math.floor(Math.random() * 3) + 1; // 1-3 answers per question
    const answers = [];
    const usedUsers = new Set();

    for (let j = 0; j < answerCount; j++) {
      let user;
      do {
        user = testUsers[Math.floor(Math.random() * testUsers.length)];
      } while (usedUsers.has(user.toString()));
      
      usedUsers.add(user.toString());

      const answerTemplate = answerTemplates[Math.floor(Math.random() * answerTemplates.length)];
      const detailedAnswer = detailedAnswers[Math.floor(Math.random() * detailedAnswers.length)];
      
      answers.push({
        user: user,
        answer: answerTemplate.replace('{answer}', detailedAnswer),
        helpful: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      });
    }

    const question = new Question({
      product: product._id,
      user: testUsers[Math.floor(Math.random() * testUsers.length)],
      question: questionTemplate,
      answers: answers,
      helpful: Math.floor(Math.random() * 30),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    });

    try {
      const savedQuestion = await question.save();
      questions.push(savedQuestion);
      console.log(`Created Q&A for ${product.name}`);
    } catch (err) {
      console.error(`Error creating Q&A:`, err.message);
    }
  }

  return questions;
};

const linkQA = async () => {
  try {
    console.log('Initializing database connection...');
    await connectDB(MONGODB_URI);
    
    const products = await Product.find({});
    if (!products.length) {
      throw new Error('No products found in database');
    }
    console.log(`Found ${products.length} products`);

    await Question.deleteMany({});
    console.log('Cleared existing Q&A');

    const testUsers = Array(20).fill().map(() => new mongoose.Types.ObjectId());
    console.log('Created test user IDs');

    for (const product of products) {
      await createQAForProduct(product, testUsers);
    }

    console.log('Successfully linked all Q&A!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Script error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

linkQA();