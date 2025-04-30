import expressValidator from 'express-validator';
const { check, validationResult } = expressValidator;

export const validateReview = [
  check('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  check('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),
  check('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateQuestion = [
  check('question')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Question must be between 10 and 300 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    next();
  }
];

export default {
  validateReview,
  validateQuestion
};