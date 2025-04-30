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
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    attributes: {
        color: String,
        size: String,
        material: String
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    images: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Variant = mongoose.model('Variant', variantSchema);

export default Variant;