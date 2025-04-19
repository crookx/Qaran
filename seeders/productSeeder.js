import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Offer from '../models/Offer.js';
import { fileURLToPath } from 'url';

dotenv.config();

// Update the URI constants to properly handle Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://qaranuser:iPyjRkJyr3gaAsX3@qaran-baby-shop.ed8u0jn.mongodb.net/qaran?retryWrites=true&w=majority&appName=Qaran-Baby-Shop';
const MONGODB_LOCAL_URI = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/qaran';

const categories = [
  {
    name: 'Clothing',
    image: '/images/categories/clothing.jpg',
    description: 'Baby clothes and accessories',
    slug: 'clothing'
  },
  {
    name: 'Feeding',
    image: '/images/categories/feeding.jpg',
    description: 'Bottles, bibs, and feeding accessories',
    slug: 'feeding'
  },
  {
    name: 'Nursery',
    image: '/images/categories/nursery.jpg',
    description: 'Cribs, bedding, and nursery furniture',
    slug: 'nursery'
  },
  {
    name: 'Healthcare',
    image: '/images/categories/healthcare.jpg',
    description: 'Baby healthcare and grooming essentials',
    slug: 'healthcare'
  },
  {
    name: 'Diapers',
    image: '/images/categories/diapers.jpg',
    description: 'Diapers, wipes, and changing accessories',
    slug: 'diapers'
  }
];

// Add a slug generation helper function after the imports
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Update the generateConsistentId function
const generateConsistentId = (index) => {
  const buffer = Buffer.alloc(12); // 12 bytes for ObjectId
  
  // Write timestamp (4 bytes) at position 0
  const timestamp = Math.floor(new Date('2025-04-11').getTime() / 1000);
  buffer.writeUInt32BE(timestamp, 0);
  
  // Write machine identifier (3 bytes) at position 4
  buffer[4] = 1;
  buffer[5] = 2;
  buffer[6] = 3;
  
  // Write process identifier (2 bytes) at position 7
  buffer.writeUInt16BE(process.pid % 0xFFFF, 7);
  
  // Write increment (3 bytes) at position 9
  buffer[9] = (index >> 16) & 0xff;
  buffer[10] = (index >> 8) & 0xff;
  buffer[11] = index & 0xff;
  
  return new mongoose.Types.ObjectId(buffer);
};

// Update generateProductsForCategory to ensure specific IDs for featured products
const generateProductsForCategory = (categorySlug, startIndex, count = 40) => {
  const products = [];
  const brands = ['BabyLux', 'TinyTots', 'KiddieComfort', 'BabyBliss', 'LittleWonders'];
  const ageGroups = ['0-3 months', '3-6 months', '6-12 months', '12-24 months'];
  const categoryItems = {
    clothing: ['Onesie', 'Romper', 'Dress', 'Pajamas', 'Bodysuit'],
    feeding: ['Bottle', 'Pacifier', 'Bib', 'High Chair', 'Breast Pump'],
    nursery: ['Crib', 'Mobile', 'Night Light', 'Storage Bin', 'Blanket'],
    healthcare: ['Thermometer', 'Nail Clipper', 'Hair Brush', 'Medicine Dispenser'],
    diapers: ['Diapers', 'Wipes', 'Changing Pad', 'Diaper Bag', 'Rash Cream']
  };

  const items = categoryItems[categorySlug] || ['Product'];

  // Instead of random featured indices, use specific indices for offer products
  const featuredProducts = new Set([0, 1, 2, 3]); // First 4 products will be featured

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const item = items[i % items.length];
    const productName = `${brand} ${item} ${i + 1}`;
    const productIndex = startIndex + i;
    
    products.push({
      _id: generateConsistentId(productIndex),
      name: productName,
      slug: generateSlug(productName),
      description: `High-quality ${item.toLowerCase()} for your baby`,
      price: parseFloat((Math.random() * 100 + 20).toFixed(2)),
      image: `/images/products/${categorySlug}/${generateSlug(item)}-${i + 1}.jpg`,
      images: [`/images/products/${categorySlug}/${generateSlug(item)}-${i + 1}.jpg`],
      brand,
      ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
      category: categorySlug,
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 200) + 50,
      featured: featuredProducts.has(i), // Use deterministic featured flag
      stock: Math.floor(Math.random() * 100) + 50,
      colors: ['White', 'Pink', 'Blue', 'Green', 'Yellow'].sort(() => Math.random() - 0.5).slice(0, 3),
      sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
      inStock: true,
      discount: 0,
      tags: [],
      features: []
    });
  }

  return products;
};

// Update the generateOffers function to take actual product IDs
const generateOffers = (clothingProducts) => {
  // Use the first 4 actual product IDs from clothing category
  const offerProducts = clothingProducts.slice(0, 4);
  const currentDate = new Date();
  
  return [
    {
      _id: generateConsistentId(1000),
      name: 'Summer Special',
      discount: 25,
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      totalQuantity: 50,
      remainingQuantity: 50,
      productId: offerProducts[0]._id
    },
    {
      _id: generateConsistentId(1001),
      name: 'Flash Sale',
      discount: 30,
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      totalQuantity: 30,
      remainingQuantity: 30,
      productId: offerProducts[1]._id
    },
    {
      _id: generateConsistentId(1002),
      name: 'New Born Special',
      discount: 20,
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      totalQuantity: 40,
      remainingQuantity: 40,
      productId: offerProducts[2]._id
    },
    {
      _id: generateConsistentId(1003),
      name: 'Premium Deal',
      discount: 35,
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      totalQuantity: 25,
      remainingQuantity: 25,
      productId: offerProducts[3]._id
    }
  ];
};

// Update the seedDatabase function
const seedDatabase = async (uri) => {
  let connection;
  try {
    console.log(`Connecting to MongoDB at ${uri}...`);
    connection = await mongoose.connect(uri);
    console.log('Connected successfully to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Offer.deleteMany({});

    // Seed categories first
    console.log('Seeding categories...');
    const savedCategories = await Category.insertMany(categories);
    
    // Create category map
    const categoryMap = {};
    savedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Generate clothing products first
    console.log('Generating clothing products...');
    const clothingProducts = generateProductsForCategory('clothing', 0, 40);
    const clothingWithCategory = clothingProducts.map(product => ({
      ...product,
      category: categoryMap['clothing']
    }));

    // Save clothing products and store the result
    console.log('Saving clothing products...');
    const savedClothingProducts = await Product.insertMany(clothingWithCategory);

    // Generate and save offers using the saved clothing products
    console.log('Generating and saving offers...');
    const offers = generateOffers(savedClothingProducts);
    await Offer.insertMany(offers);

    // Log the created offers and their product IDs for verification
    console.log('Created offers with product IDs:', offers.map(o => ({
      offerName: o.name,
      productId: o.productId
    })));

    // Generate and save remaining categories' products
    console.log('Saving remaining products...');
    let productIndex = 40; // Start after clothing products
    for (const category of categories.slice(1)) {
      const categoryProducts = generateProductsForCategory(category.slug, productIndex, 40);
      productIndex += 40;
      
      const productsWithCategory = categoryProducts.map(product => ({
        ...product,
        category: categoryMap[category.slug]
      }));
      
      await Product.insertMany(productsWithCategory);
    }

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
};

// Add this function before runSeeder
const verifySeeding = async (uri) => {
  const conn = await mongoose.connect(uri);
  try {
    const productsCount = await Product.countDocuments();
    const offersCount = await Offer.countDocuments();
    const categoriesCount = await Category.countDocuments();

    console.log(`Verification for ${uri}:`);
    console.log(`- Products: ${productsCount}`);
    console.log(`- Offers: ${offersCount}`);
    console.log(`- Categories: ${categoriesCount}`);

    return {
      success: productsCount > 0 && offersCount > 0 && categoriesCount > 0,
      counts: { productsCount, offersCount, categoriesCount }
    };
  } finally {
    await conn.disconnect();
  }
};

// Update runSeeder to include verification
const runSeeder = async () => {
  try {
    // First seed MongoDB Atlas if URI is available
    if (MONGODB_URI) {
      console.log('Seeding MongoDB Atlas...');
      await seedDatabase(MONGODB_URI);
      const atlasVerification = await verifySeeding(MONGODB_URI);
      console.log('MongoDB Atlas seeding verification:', atlasVerification);
    } else {
      console.log('MongoDB Atlas URI not found in environment variables, skipping Atlas seeding');
    }

    // Then seed local MongoDB with correct database name
    console.log('Seeding local MongoDB...');
    await seedDatabase(MONGODB_LOCAL_URI);
    const localVerification = await verifySeeding(MONGODB_LOCAL_URI);
    console.log('Local MongoDB seeding verification:', localVerification);

    console.log('All database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeeder();
}

export default runSeeder;