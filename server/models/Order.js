const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    metrics: {
        preparationTime: {
            type: Number,
            default: 0
        },
        temperature: {
            type: Number,
            default: 0
        },
        quality: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 