const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    type: {
        type: String,
        enum: ['warning', 'critical', 'maintenance'],
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
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    resolvedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema); 