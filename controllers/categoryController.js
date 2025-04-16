import Category from '../models/Category.js';
import catchAsync from '../utils/catchAsync.js';

export const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

export const getCategoryBySlug = catchAsync(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});