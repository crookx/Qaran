import mongoose from 'mongoose';

const inventoryHistorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['increment', 'decrement', 'adjustment'],
        required: true
    },
    quantity: {
        type: Number
    },
    oldStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    reason: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

export default InventoryHistory;