import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  {
    name: 'Clothing',
    image: '/images/categories/clothing.jpg',
    description: 'Baby clothes and accessories'
  },
  {
    name: 'Feeding',
    image: '/images/categories/feeding.jpg',
    description: 'Bottles, bibs, and feeding accessories'
  },
  {
    name: 'Nursery',
    image: '/images/categories/nursery.jpg',
    description: 'Cribs, bedding, and nursery furniture'
  },
  {
    name: 'Healthcare',
    image: '/images/categories/healthcare.jpg',
    description: 'Baby healthcare and grooming essentials'
  },
  {
    name: 'Diapers',
    image: '/images/categories/diapers.jpg',
    description: 'Diapers, wipes, and changing accessories'
  },
  {
    name: 'Travel Gear',
    image: '/images/categories/travel.jpg',
    description: 'Strollers, car seats, and travel accessories'
  },
  {
    name: 'Bath & Skincare',
    image: '/images/categories/bath.jpg',
    description: 'Baby bath products and skincare essentials'
  },
  {
    name: 'Safety',
    image: '/images/categories/safety.jpg',
    description: 'Baby proofing and safety equipment'
  }
];

const products = [
  // Clothing Category
  {
    name: 'Organic Cotton Romper Set',
    description: 'Set of 3 organic cotton rompers perfect for everyday wear',
    price: 34.99,
    image: '/images/products/romper-set.jpg',
    brand: 'BabyNaturals',
    ageGroup: '0-6',
    ratings: 4.8,
    numReviews: 156,
    featured: true
  },
  {
    name: 'Winter Baby Snowsuit',
    description: 'Warm and cozy snowsuit for winter protection',
    price: 49.99,
    image: '/images/products/snowsuit.jpg',
    brand: 'CozyKids',
    ageGroup: '6-12',
    ratings: 4.7,
    numReviews: 89
  },
  // Feeding Category
  {
    name: 'Anti-Colic Bottle Set',
    description: 'Set of 3 anti-colic bottles with different flow rates',
    price: 29.99,
    image: '/images/products/bottle-set.jpg',
    brand: 'BabyComfort',
    ageGroup: '0-6',
    ratings: 4.9,
    numReviews: 234,
    featured: true
  },
  {
    name: 'Silicone Feeding Set',
    description: 'Complete silicone feeding set with plate, spoon, and cup',
    price: 24.99,
    image: '/images/products/feeding-set.jpg',
    brand: 'MunchKin',
    ageGroup: '6-12',
    ratings: 4.6,
    numReviews: 178
  },
  // Nursery Category
  {
    name: '4-in-1 Convertible Crib',
    description: 'Convertible crib that grows with your child',
    price: 299.99,
    image: '/images/products/convertible-crib.jpg',
    brand: 'DreamNest',
    ageGroup: '0-6',
    ratings: 4.9,
    numReviews: 345,
    featured: true
  },
  // Add 20 more products following this pattern...
];

// Function to generate random products
const generateMoreProducts = (baseProducts, count) => {
  const moreProducts = [];
  const brands = ['BabyLux', 'TinyTots', 'KiddieComfort', 'BabyBliss', 'LittleWonders'];
  const adjectives = ['Soft', 'Cozy', 'Premium', 'Deluxe', 'Essential', 'Natural'];
  const items = ['Onesie', 'Blanket', 'Toy', 'Bottle', 'Pacifier', 'Diaper Bag'];

  for (let i = 0; i < count; i++) {
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const randomPrice = (Math.random() * 100 + 10).toFixed(2);
    const randomAgeGroup = ['0-6', '6-12', '1-2', '2-4'][Math.floor(Math.random() * 4)];
    const randomRating = (Math.random() * (5 - 4) + 4).toFixed(1);

    moreProducts.push({
      name: `${randomAdj} ${randomItem}`,
      description: `High-quality ${randomItem.toLowerCase()} for your baby's comfort`,
      price: parseFloat(randomPrice),
      image: `/images/products/${randomItem.toLowerCase().replace(' ', '-')}-${i + 1}.jpg`,
      brand: randomBrand,
      ageGroup: randomAgeGroup,
      ratings: parseFloat(randomRating),
      numReviews: Math.floor(Math.random() * 200 + 50),
      featured: Math.random() > 0.8
    });
  }

  return [...baseProducts, ...moreProducts];
};

const allProducts = generateMoreProducts(products, 40); // Generate 40 more products

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db');
    
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    // Map category names to their IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Assign random categories to products
    const productsWithCategories = allProducts.map(product => ({
      ...product,
      category: createdCategories[Math.floor(Math.random() * createdCategories.length)]._id
    }));

    // Seed products
    await Product.insertMany(productsWithCategories);
    console.log('Products seeded successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();