import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'system', 'promotion', 'other'],
        default: 'other'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;