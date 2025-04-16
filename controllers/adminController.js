import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { deleteFile } from '../utils/fileHelper.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        const [userCount, orderCount, productCount, recentOrders] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Order.countDocuments(),
            Product.countDocuments(),
            Order.find().sort('-createdAt').limit(5).populate('user', 'name email')
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                userCount,
                orderCount,
                productCount,
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json({
            status: 'success',
            data: { users }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product');
        res.status(200).json({
            status: 'success',
            data: { orders }
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!order) {
            return next(new AppError('Order not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            status: 'success',
            data: { products }
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const productData = {
            ...req.body,
            images: req.files ? req.files.map(file => file.path) : []
        };
        
        const product = await Product.create(productData);
        res.status(201).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };
        if (req.files?.length) {
            productData.images = req.files.map(file => file.path);
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        
        res.status(200).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        
        // Delete associated images
        if (product.images?.length) {
            await Promise.all(product.images.map(image => deleteFile(image)));
        }
        
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};