const User = require('../models/User');
const Task = require('../models/Task');
const Thought = require('../models/Thought');
const Reflection = require('../models/Reflection');
const { chatWithAI } = require('../services/geminiService');

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        // Get comprehensive user data for context
        const user = await User.findById(req.user.id);

        // Get today's tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasks = await Task.find({
            userId: req.user.id,
            scheduledFor: { $gte: today, $lt: tomorrow }
        });

        // Get all tasks for schedule overview
        const allTasks = await Task.find({ userId: req.user.id })
            .sort({ scheduledFor: 1 })
            .limit(20);

        // Get recent thoughts
        const recentThoughts = await Thought.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent reflections
        const recentReflections = await Reflection.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(3);

        // Calculate completion rate
        const completedTasks = await Task.countDocuments({
            userId: req.user.id,
            status: 'completed'
        });
        const totalTasks = await Task.countDocuments({ userId: req.user.id });
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Build comprehensive context
        const userData = {
            patterns: user.patterns,
            todayTasksCount: todayTasks.length,
            completionRate,
            todayTasks: todayTasks.map(t => ({
                title: t.title,
                status: t.status,
                scheduledFor: t.scheduledFor,
                difficulty: t.difficulty,
                priority: t.priority
            })),
            allScheduledTasks: allTasks
                .filter(t => t.scheduledFor && t.status !== 'completed')
                .map(t => ({
                    title: t.title,
                    scheduledFor: t.scheduledFor,
                    status: t.status
                })),
            recentThoughts: recentThoughts.map(t => ({
                content: t.content,
                insights: t.processedInsights,
                createdAt: t.createdAt
            })),
            recentReflections: recentReflections.map(r => ({
                date: r.date,
                wentWell: r.wentWell,
                feltHeavy: r.feltHeavy,
                wasOverloaded: r.wasOverloaded
            }))
        };

        // Get AI response with full context
        const aiResponse = await chatWithAI(message, userData);

        res.status(200).json({
            message: aiResponse,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Chat history feature coming soon',
            history: []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendMessage,
    getChatHistory
};