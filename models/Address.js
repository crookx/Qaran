import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addressType: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    streetAddress: {
        type: String,
        required: [true, 'Street address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required']
    },
    postalCode: {
        type: String,
        required: [true, 'Postal code is required']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;