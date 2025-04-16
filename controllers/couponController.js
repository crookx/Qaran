import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorHandler.js';

export const createCoupon = async (req, res, next) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { coupon: newCoupon }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({
      status: 'success',
      data: { coupons }
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ 
      code, 
      isActive: true,
      expiryDate: { $gt: Date.now() }
    });
    
    if (!coupon) {
      return next(new AppError('Invalid or expired coupon', 400));
    }
    
    res.status(200).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};