import User from '../models/User.js';
import Address from '../models/Address.js';
import { AppError } from '../middleware/errorHandler.js';
import { deleteFile } from '../utils/fileHelper.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id).select('+password');
        
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return next(new AppError('Current password is incorrect', 401));
        }
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProfile = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { active: false });
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user: req.user.id });
        res.status(200).json({
            status: 'success',
            data: { addresses }
        });
    } catch (error) {
        next(error);
    }
};

export const addAddress = async (req, res, next) => {
    try {
        const address = await Address.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json({
            status: 'success',
            data: { address }
        });
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req, res, next) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { address }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: req.file.path },
            { new: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.avatar) {
            await deleteFile(user.avatar);
            user.avatar = undefined;
            await user.save();
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};