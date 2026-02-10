//task schema or structure 

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['ai-scheduled', 'manual'],
        default: 'ai-scheduled'
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'in-progress', 'completed', 'postponed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    difficulty: {
        type: String,
        enum: ['light', 'medium', 'heavy'],
        default: 'medium'
    },
    estimatedDuration: {
        type: Number,
        default: 60
    },
    actualDuration: {
        type: Number
    },
    deadline: {
        type: Date
    },
    scheduledFor: {
        type: Date
    },
    scheduledEndTime: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    postponedCount: {
        type: Number,
        default: 0
    },
    createdFrom: {
        type: String,
        enum: ['manual', 'thought', 'reflection'],
        default: 'manual'
    },
    relatedThoughtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thought'
    },
    schedulingReason: {
        type: String
    }
}, {
    timestamps: true
});

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model('Task', taskSchema);