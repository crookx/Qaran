import mongoose from 'mongoose';
import { productTemplates } from '../../scripts/productData.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const generateSlug = (name, categoryKey) => {
  const baseSlug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${baseSlug}-${categoryKey}`;
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data...');

    // Seed categories
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
      },
      {
        name: 'Toys & Entertainment',
        image: '/images/categories/toys.jpg',
        description: 'Baby toys, teething rings, books, and educational games',
        slug: 'toys'
      }
    ];

    const savedCategories = await Category.insertMany(categories);
    console.log('Categories seeded successfully!');

    // Generate products
    const products = [];
    for (const [categoryKey, template] of Object.entries(productTemplates)) {
      const category = savedCategories.find(c => c.slug === categoryKey) || savedCategories[0];
      
      for (const name of template.names) {
        const slug = generateSlug(name, categoryKey);
        const product = {
          name,
          slug,
          description: template.descriptions[Math.floor(Math.random() * template.descriptions.length)],
          price: Math.floor(Math.random() * (template.priceRange.max - template.priceRange.min) + template.priceRange.min) / 100,
          category: category._id,
          ageGroup: '0-3 months',
          colors: template.colors || ['Default'],
          sizes: template.sizes || ['One Size'],
          variants: [],
          stock: 100,
          rating: 4.8,
          reviewCount: 0,
          image: `/images/products/${template.imagePrefix}-1.jpg`,
          images: [
            `/images/products/${template.imagePrefix}-1.jpg`,
            `/images/products/${template.imagePrefix}-2.jpg`
          ],
          brand: 'BabyNaturals',
          specifications: {
            material: 'Premium Quality',
            care: ['Machine washable'],
            warranty: '1 year'
          },
          featured: Math.random() > 0.8,
          discount: Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0,
          inStock: true
        };
        products.push(product);
      }
    }

    await Product.insertMany(products);
    console.log('Products seeded successfully!');

    await mongoose.connection.close();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();