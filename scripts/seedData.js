import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  {
    name: "Clothing",
    image: "/images/categories/clothing.jpg",
    description: "Adorable and comfortable baby clothes",
    slug: "clothing"
  },
  {
    name: "Feeding",
    image: "/images/categories/feeding.jpg",
    description: "Bottles, breast pumps, and feeding accessories",
    slug: "feeding"
  },
  {
    name: "Diapering",
    image: "/images/categories/diapering.jpg",
    description: "Diapers, wipes, and changing accessories",
    slug: "diapering"
  },
  {
    name: "Bath & Skincare",
    image: "/images/categories/bath-skincare.jpg",
    description: "Gentle bath products and skincare essentials",
    slug: "bath-skincare"
  },
  {
    name: "Nursery",
    image: "/images/categories/nursery.jpg",
    description: "Cribs, bedding, and nursery furniture",
    slug: "nursery"
  },
  {
    name: "Toys",
    image: "/images/categories/toys.jpg",
    description: "Educational and fun toys for development",
    slug: "toys"
  },
  {
    name: "Safety",
    image: "/images/categories/safety.jpg",
    description: "Baby proofing and safety equipment",
    slug: "safety"
  },
  {
    name: "Travel",
    image: "/images/categories/travel.jpg",
    description: "Strollers, car seats, and travel gear",
    slug: "travel"
  }
];

// Example fix for a few products to show the pattern
// Example of updated products with standardized age groups
const products = [
  {
    name: "Organic Cotton Onesie Set",
    price: 29.99,
    category: "clothing",
    description: "Set of 5 organic cotton onesies in neutral colors",
    image: "/images/products/onesie-set-1.jpg", // Primary image
    images: ["/images/products/onesie-set-1.jpg", "/images/products/onesie-set-2.jpg"],
    sizes: ["0-3M", "3-6M", "6-9M", "9-12M"],
    colors: ["White", "Beige", "Gray", "Sage", "Lavender"],
    brand: "BabyNaturals",
    ageGroup: "0-3 months",  // Changed from "0-12m" to valid enum
    inStock: true,
    rating: 4.8,
    reviews: 125,
    featured: true
  },
  {
    name: "Winter Snowsuit",
    price: 49.99,
    category: "clothing",
    description: "Warm and cozy snowsuit with hood",
    image: "/images/products/snowsuit-1.jpg", // Added primary image
    images: ["/images/products/snowsuit-1.jpg"],
    sizes: ["6-12M", "12-18M", "18-24M"],
    colors: ["Navy", "Pink", "Red"],
    brand: "CozyKids",
    ageGroup: "6-12 months",  // Changed from "6-24m" to valid enum
    inStock: true,
    rating: 4.7,
    reviews: 89
  }
];

// Update moreProducts with the same pattern
// Fix the remaining invalid age group in moreProducts
const moreProducts = [
  {
    name: "Bamboo Sleep Sack",
    price: 39.99,
    category: "sleep",
    description: "Temperature-regulating sleep sack made from bamboo fabric",
    image: "/images/products/sleep-sack.jpg", // Added primary image
    images: ["/images/products/sleep-sack.jpg"],
    sizes: ["0-6M", "6-18M", "18-36M"],
    colors: ["Cloud White", "Sage Green", "Lavender"],
    brand: "DreamSleep",
    ageGroup: "infant", // Changed from "0-36m" to valid enum
    inStock: true,
    rating: 4.9,
    reviews: 203,
    specifications: {
      material: "100% Bamboo Viscose",
      tog: "1.0",
      closure: "Two-way zipper"
    }
  },
  {
    name: "Adjustable High Chair",
    price: 149.99,
    category: "mealtime",
    description: "7-position adjustable high chair with removable tray",
    image: "/images/products/highchair.jpg", // Added primary image
    images: ["/images/products/highchair.jpg"],
    colors: ["Gray/White", "Black/Wood", "Pink/Gold"],
    brand: "MealMaster",
    ageGroup: "12-24 months",  // Changed from "6m-3y" to valid enum value
    inStock: true,
    rating: 4.7,
    reviews: 342,
    featured: true
  },
  {
    name: "Welcome Baby Gift Set",
    price: 129.99,
    category: "gift-sets",
    description: "Luxury gift set including essentials for newborn",
    images: ["/images/products/gift-set.jpg"],
    brand: "LuxeBaby",
    ageGroup: "0-3 months",  // Changed from "0-6m" to valid enum
    inStock: true,
    rating: 4.8,
    reviews: 156,
    specifications: {
      includes: [
        "Organic cotton blanket",
        "2 onesies",
        "Wooden rattle",
        "Natural bath products"
      ]
    }
  },
  {
    name: "Interactive Learning Tablet",
    price: 79.99,
    category: "educational",
    description: "Kid-safe tablet with educational games and parental controls",
    image: "/images/products/tablet.jpg",
    images: ["/images/products/tablet.jpg", "/images/products/tablet-2.jpg"],
    brand: "EduTech",
    ageGroup: "24+ months",
    inStock: true,
    stock: 45,
    rating: 4.7,
    reviews: 189,
    colors: ["Blue", "Pink", "Green"],
    featured: true
  },
  {
    name: "Soft Stacking Blocks",
    price: 19.99,
    category: "toys",
    description: "Set of 10 soft fabric blocks with numbers and patterns",
    image: "/images/products/soft-blocks.jpg",
    images: ["/images/products/soft-blocks.jpg"],
    brand: "BabyLearn",
    ageGroup: "3-6 months",
    inStock: true,
    stock: 120,
    rating: 4.9,
    reviews: 234,
    featured: false
  },
  {
    name: "Baby Carrier Premium",
    price: 129.99,
    category: "travel",
    description: "Ergonomic baby carrier with multiple carrying positions",
    image: "/images/products/carrier.jpg",
    images: ["/images/products/carrier.jpg", "/images/products/carrier-2.jpg"],
    brand: "ComfortCarry",
    ageGroup: "0-3 months",
    inStock: true,
    stock: 75,
    rating: 4.8,
    reviews: 312,
    colors: ["Black", "Navy", "Grey"],
    featured: true
  }
];

// Merge all products
// After all the product definitions, replace the merge line with:
const allProducts = [
  ...products,
  ...moreProducts
];

// Then update the seeding part to use allProducts instead of products:
// Fix the category mapping in the seedDB function
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db');
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data...');

    // Insert categories
    const savedCategories = await Category.insertMany(categories);
    console.log('Categories seeded successfully!');

    // Create category map for easy reference
    const categoryMap = {};
    savedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update products with category references and ensure all fields are valid
    const productsWithRefs = allProducts.map(product => ({
      ...product,
      category: categoryMap[product.category] || categoryMap['clothing'], // Ensure category exists
      ageGroup: product.ageGroup === 'infant' ? '0-3 months' : product.ageGroup, // Fix any remaining infant values
      stock: product.stock || 100, // Ensure stock has a default value
      image: product.image || product.images[0], // Ensure primary image exists
    }));

    // Insert products
    await Product.insertMany(productsWithRefs);
    console.log('Products seeded successfully!');

    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();

// Add these to moreProducts array
const additionalProducts = [
  {
    name: "Educational Building Blocks",
    price: 34.99,
    category: "toys",
    description: "Colorful wooden building blocks with numbers and letters",
    image: "/images/products/blocks.jpg",
    images: ["/images/products/blocks.jpg", "/images/products/blocks-2.jpg"],
    brand: "SmartPlay",
    ageGroup: "12-24 months",
    inStock: true,
    rating: 4.7,
    reviews: 156
  },
  {
    name: "Baby's First Book Set",
    price: 24.99,
    category: "educational",
    description: "Set of 4 soft fabric books with different textures",
    image: "/images/products/baby-books.jpg",
    images: ["/images/products/baby-books.jpg"],
    brand: "EduBaby",
    ageGroup: "3-6 months",
    inStock: true,
    rating: 4.9,
    reviews: 203
  },
  {
    name: "Toddler Kitchen Helper Tower",
    price: 89.99,
    category: "safety",
    description: "Adjustable wooden kitchen helper with safety rails",
    image: "/images/products/helper-tower.jpg",
    images: ["/images/products/helper-tower.jpg"],
    brand: "SafeBaby",
    ageGroup: "24+ months",
    inStock: true,
    rating: 4.8,
    reviews: 167
  }
  // Add to moreProducts array
];

moreProducts.push(...additionalProducts);