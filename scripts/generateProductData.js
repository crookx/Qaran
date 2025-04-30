import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const reviewTemplates = [
  { rating: 5, comments: [
    "Absolutely perfect! Just what we needed for our baby.",
    "Great quality and fast delivery. Very satisfied!",
    "Exceeded my expectations. Will buy again.",
    "Best baby product we've purchased so far."
  ]},
  { rating: 4, comments: [
    "Good product, slight room for improvement.",
    "Nice quality but shipping took longer than expected.",
    "Pretty good value for money.",
    "Would recommend with minor reservations."
  ]},
  { rating: 3, comments: [
    "Average product, serves its purpose.",
    "Okay quality but a bit pricey.",
    "Does the job but nothing special.",
    "Expected better for the price."
  ]}
];

const generateSKU = (productName, color, size, index) => {
  const nameCode = productName.substring(0, 3).toUpperCase();
  const colorCode = color.substring(0, 2).toUpperCase();
  const sizeCode = size ? size.replace(/[^0-9]/g, '').padStart(2, '0') : '00';
  const uniqueId = (Date.now() % 1000000).toString().padStart(6, '0');
  return `${nameCode}-${colorCode}${sizeCode}-${uniqueId}-${index}`;
};

const generateVariants = async (product) => {
  const variants = [];
  const colors = product.colors || ['Default'];
  const sizes = product.sizes || ['One Size'];
  let variantIndex = 0;

  for (const color of colors) {
    for (const size of sizes) {
      const variant = {
        product: product._id,
        sku: generateSKU(product.name, color, size, variantIndex++),
        name: `${product.name} - ${color}${size !== 'One Size' ? ` (${size})` : ''}`,
        attributes: {
          color,
          size
        },
        price: product.price,
        stock: Math.floor(Math.random() * 50) + 10,
        images: [product.image],
        isActive: true
      };
      variants.push(variant);
    }
  }
  
  return variants;
};

const generateInventory = async (variant) => {
  return {
    product: variant.product,
    variant: variant._id,
    currentStock: variant.stock,
    lowStockThreshold: 5,
    transactions: [{
      type: 'purchase',
      quantity: variant.stock,
      date: new Date(),
      reference: 'Initial Stock'
    }]
  };
};

const generateReviews = async (product, users) => {
  const reviewCount = Math.floor(Math.random() * 3) + 1; // 1-3 reviews per product
  const reviews = [];
  const usedUsers = new Set(); // Track which users have already reviewed this product

  for (let i = 0; i < reviewCount && usedUsers.size < users.length; i++) {
    let user;
    do {
      user = users[Math.floor(Math.random() * users.length)];
    } while (usedUsers.has(user._id.toString()));

    usedUsers.add(user._id.toString());
    
    const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
    reviews.push({
      user: user._id,
      product: product._id,
      rating: template.rating,
      comment: template.comments[Math.floor(Math.random() * template.comments.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7776000000)) // Random date within last 90 days
    });
  }

  return reviews;
};

const populateProductData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Get all products and users
    const products = await Product.find();
    const users = await User.find();

    if (users.length === 0) {
      throw new Error('No users found. Please seed users first.');
    }

    console.log(`Found ${products.length} products and ${users.length} users`);

    // Clear existing data
    await Variant.deleteMany({});
    await Review.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing variants, reviews, and inventory');

    // Generate and save data for each product
    for (const product of products) {
      // Generate variants
      const variantDocs = await generateVariants(product);
      const savedVariants = await Variant.insertMany(variantDocs);
      console.log(`Created ${savedVariants.length} variants for ${product.name}`);

      // Generate inventory for each variant
      const inventoryDocs = await Promise.all(savedVariants.map(generateInventory));
      await Inventory.insertMany(inventoryDocs);
      console.log(`Created inventory records for ${product.name} variants`);

      // Generate reviews
      const reviewDocs = await generateReviews(product, users);
      await Review.insertMany(reviewDocs);
      console.log(`Created ${reviewDocs.length} reviews for ${product.name}`);

      // Update product with variant references
      product.variants = savedVariants.map(v => v._id);
      await product.save();
    }

    console.log('Successfully populated all product data!');
    await mongoose.connection.close();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('Error populating data:', error);
    process.exit(1);
  }
};

populateProductData();