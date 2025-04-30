import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProductQuestions,
  submitQuestion,
  markHelpful
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/product/:productId', getProductQuestions);

// Protected routes
router.use(protect);
router.post('/product/:productId', submitQuestion);
router.post('/:questionId/helpful', markHelpful);

export default router;