import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const createSystemUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    let systemUser = await User.findOne({ email: 'system@qaran.com' });
    
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System',
        email: 'system@qaran.com',
        password: 'systempass123!',
        role: 'system',
        isActive: true
      });
      console.log('System user created successfully');
    } else {
      console.log('System user already exists');
    }

    console.log('System User ID:', systemUser._id);
    
    // Store the system user ID in a file for other scripts to use
    await mongoose.connection.close();
    
    return systemUser._id;
  } catch (error) {
    console.error('Error creating system user:', error);
    process.exit(1);
  }
};

createSystemUser();