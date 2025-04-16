import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  slug: String
}, { 
  collection: 'categories',  // Explicitly specify collection name
  timestamps: false 
});

const Category = mongoose.model('Category', categorySchema);
export default Category;