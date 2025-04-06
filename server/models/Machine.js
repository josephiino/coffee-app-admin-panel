const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'maintenance'],
        default: 'offline'
    },
    metrics: {
        temperature: {
            type: Number,
            default: 0
        },
        humidity: {
            type: Number,
            default: 0
        },
        waterPressure: {
            type: Number,
            default: 0
        }
    },
    lastMaintenance: {
        type: Date,
        default: Date.now
    },
    nextMaintenance: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün sonra
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Machine', machineSchema); 