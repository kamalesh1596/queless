const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
    {
        queueName: {
            type: String,
            required: true,
        },
        currentToken: {
            type: Number,
            default: 0,
        },
        lastToken: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'paused', 'closed'],
            default: 'active',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Queue', queueSchema);