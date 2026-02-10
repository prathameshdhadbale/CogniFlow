// reflection schema 

const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true
    },
    wentWell: {
        type: String
    },
    feltHeavy: {
        type: String
    },
    wasOverloaded: {
        type: String,
        enum: ['no', 'slight', 'yes'],
        default: 'no'
    },
    scheduleAccuracy: {
        type: String,
        enum: ['very', 'mostly', 'somewhat', 'not']
    },
    completedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    missedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    insights: [{
        type: {
            type: String
        },
        value: {
            type: String
        }
    }]
}, {
    timestamps: true
});

reflectionSchema.index({ userId: 1, date: 1 }, { unique: true });
reflectionSchema.index({ date: -1 });

module.exports = mongoose.model('Reflection', reflectionSchema);