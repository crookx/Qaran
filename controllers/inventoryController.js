import Product from '../models/Product.js';
import InventoryHistory from '../models/InventoryHistory.js';
import { AppError } from '../middleware/errorHandler.js';

export const getInventory = async (req, res, next) => {
    try {
        const inventory = await Product.find()
            .select('name sku stock stockThreshold price category');

        res.status(200).json({
            status: 'success',
            data: { inventory }
        });
    } catch (error) {
        next(error);
    }
};

export const getLowStock = async (req, res, next) => {
    try {
        const lowStock = await Product.find({
            $expr: {
                $lte: ['$stock', '$stockThreshold']
            }
        }).select('name sku stock stockThreshold');

        res.status(200).json({
            status: 'success',
            data: { lowStock }
        });
    } catch (error) {
        next(error);
    }
};

export const updateStock = async (req, res, next) => {
    try {
        const { quantity, type = 'add' } = req.body;
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        const oldStock = product.stock;
        product.stock = type === 'add' 
            ? product.stock + quantity
            : product.stock - quantity;

        if (product.stock < 0) {
            return next(new AppError('Stock cannot be negative', 400));
        }

        await product.save();

        // Record the stock change
        await InventoryHistory.create({
            product: product._id,
            type: type === 'add' ? 'increment' : 'decrement',
            quantity,
            oldStock,
            newStock: product.stock,
            updatedBy: req.user.id
        });

        res.status(200).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

export const getInventoryHistory = async (req, res, next) => {
    try {
        const { productId, startDate, endDate } = req.query;
        
        const query = {};
        if (productId) query.product = productId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const history = await InventoryHistory.find(query)
            .populate('product', 'name sku')
            .populate('updatedBy', 'name')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { history }
        });
    } catch (error) {
        next(error);
    }
};

export const addInventoryAdjustment = async (req, res, next) => {
    try {
        const { productId, quantity, reason } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        const oldStock = product.stock;
        product.stock = quantity;
        await product.save();

        await InventoryHistory.create({
            product: product._id,
            type: 'adjustment',
            oldStock,
            newStock: quantity,
            reason,
            updatedBy: req.user.id
        });

        res.status(200).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};