import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: { notifications }
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const clearAllNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ user: req.user.id });

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};