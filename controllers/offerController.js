import Offer from '../models/Offer.js';
import Product from '../models/Product.js';
import AppError from '../utils/appError.js';

export const getOffers = async (req, res) => {
  try {
    console.log('Fetching offers...');
    const currentDate = new Date();
    
    // Debug: Log current date
    console.log('Current date:', currentDate);

    // First, get all offers for debugging
    const allOffers = await Offer.find({});
    console.log('All offers in database:', allOffers);

    // Then get active offers
    const activeOffers = await Offer.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).populate('productId');

    console.log('Active offers found:', activeOffers);

    const formattedOffers = await Promise.all(
      activeOffers
        .filter(offer => offer.productId) // Filter out offers with no product
        .map(async (offer) => {
          const product = offer.productId;
          const originalPrice = product.price;
          const discountedPrice = Math.round(originalPrice * (1 - offer.discount / 100));

          return {
            _id: offer._id,
            name: offer.name,
            productId: product._id,
            productName: product.name,
            image: product.image,
            price: originalPrice,
            discountedPrice: discountedPrice,
            discount: offer.discount,
            timeLeft: getTimeRemaining(offer.endDate),
            remaining: offer.remainingQuantity,
            total: offer.totalQuantity,
            startDate: offer.startDate,
            endDate: offer.endDate
          };
        })
    );

    console.log('Formatted offers:', formattedOffers);

    res.status(200).json({
      status: 'success',
      data: formattedOffers
    });
  } catch (error) {
    console.error('Error in getOffers:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getTimeRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h`;
};