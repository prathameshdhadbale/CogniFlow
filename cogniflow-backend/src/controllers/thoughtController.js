const Thought = require('../models/Thought');
const User = require('../models/User');
const { processThought } = require('../services/geminiService');


const getThoughts = async (req, res) => {
    try {
        const thoughts = await Thought.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(thoughts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getThought = async (req, res) => {
    try {
        const thought = await Thought.findById(req.params.id);

        if (!thought) {
            return res.status(404).json({ message: 'Thought not found' });
        }

        if (thought.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json(thought);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createThought = async (req, res) => {
    try {
        const { content } = req.body;

         // Get user for context
        const user = await User.findById(req.user.id);
        
        // Get recent tasks count
        const Task = require('../models/Task');
        const recentTasksCount = await Task.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        const userContext = {
            patterns: user.patterns,
            recentTasksCount
        };

        // Process thought with AI
        const insights = await processThought(content, userContext);

        // Create thought with AI-generated insights
        const thought = await Thought.create({
            userId: req.user.id,
            content,
            processedInsights: insights,
            affectedScheduling: insights.length > 0
        });

        res.status(201).json(thought);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getThoughts,
    getThought,
    createThought
};