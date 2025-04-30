import Offer from '../models/Offer.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

export const getOffers = async (req, res, next) => {
  try {
    const currentDate = new Date();
    console.log('Fetching offers, current date:', currentDate);

    const offers = await Offer.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      remainingQuantity: { $gt: 0 }
    }).populate('productId');

    console.log('Raw offers from DB:', JSON.stringify(offers, null, 2));

    const formattedOffers = offers
      .filter(offer => {
        const hasProduct = !!offer.productId;
        if (!hasProduct) {
          console.log('Offer missing product:', offer._id);
        }
        return hasProduct;
      })
      .map(offer => {
        const originalPrice = offer.productId.price;
        const discountedPrice = originalPrice * (1 - offer.discount / 100);
        
        return {
          _id: offer._id,
          name: offer.name,
          product: offer.productId,
          discount: offer.discount,
          originalPrice,
          discountedPrice,
          remainingQuantity: offer.remainingQuantity,
          totalQuantity: offer.totalQuantity,
          startDate: offer.startDate,
          endDate: offer.endDate
        };
      });

    console.log('Formatted offers:', JSON.stringify(formattedOffers, null, 2));

    res.status(200).json({
      status: 'success',
      data: { offers: formattedOffers }
    });
  } catch (error) {
    console.error('Error in getOffers:', error);
    next(error);
  }
};

export const updateOfferQuantity = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }

    if (offer.remainingQuantity <= 0) {
      return next(new AppError('Offer is out of stock', 400));
    }

    offer.remainingQuantity -= 1;
    await offer.save();

    res.status(200).json({
      status: 'success',
      data: { offer }
    });
  } catch (error) {
    next(error);
  }
};