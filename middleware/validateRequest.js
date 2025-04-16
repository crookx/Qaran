import Joi from 'joi';

export const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const productQuerySchema = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
  sort: Joi.string().valid('price_asc', 'price_desc', 'name_asc', 'newest'),
  category: Joi.string(),
  priceRange: Joi.string().pattern(/^\d+-\d+$/),
  ageGroup: Joi.string(),
  search: Joi.string().min(2)
});