import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import { AppError } from '../middleware/errorHandler.js';
import { deleteFile } from '../utils/fileHelper.js';

export const getVariants = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const variants = await Variant.find({ product: productId });

        res.status(200).json({
            status: 'success',
            data: { variants }
        });
    } catch (error) {
        next(error);
    }
};

export const getVariant = async (req, res, next) => {
    try {
        const variant = await Variant.findById(req.params.id);
        
        if (!variant) {
            return next(new AppError('Variant not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { variant }
        });
    } catch (error) {
        next(error);
    }
};

export const createVariant = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        const variantData = {
            ...req.body,
            product: productId,
            images: req.files ? req.files.map(file => file.path) : []
        };

        const variant = await Variant.create(variantData);

        res.status(201).json({
            status: 'success',
            data: { variant }
        });
    } catch (error) {
        next(error);
    }
};

export const updateVariant = async (req, res, next) => {
    try {
        const variantData = { ...req.body };
        if (req.files?.length) {
            variantData.images = req.files.map(file => file.path);
        }

        const variant = await Variant.findByIdAndUpdate(
            req.params.id,
            variantData,
            { new: true, runValidators: true }
        );

        if (!variant) {
            return next(new AppError('Variant not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { variant }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteVariant = async (req, res, next) => {
    try {
        const variant = await Variant.findById(req.params.id);
        
        if (!variant) {
            return next(new AppError('Variant not found', 404));
        }

        // Delete associated images
        if (variant.images?.length) {
            await Promise.all(variant.images.map(image => deleteFile(image)));
        }

        await variant.deleteOne();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};