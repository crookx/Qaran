import express from 'express';
import { getOffers, updateOfferQuantity } from '../controllers/offerController.js';

const router = express.Router();

router.get('/', getOffers);
router.patch('/:offerId/quantity', updateOfferQuantity);

export default router;