import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    attributes: {
        type: Map,
        of: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    images: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
variantSchema.index({ product: 1, sku: 1 });

const Variant = mongoose.model('Variant', variantSchema);

export default Variant;