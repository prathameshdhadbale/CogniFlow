const User = require('../models/User');
const Task = require('../models/Task');
const { chatWithAI } = require('../services/geminiService');

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        // Get user data for context
        const user = await User.findById(req.user.id);

        // Get today's tasks count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasksCount = await Task.countDocuments({
            userId: req.user.id,
            scheduledFor: { $gte: today, $lt: tomorrow }
        });

        // Calculate completion rate
        const completedTasks = await Task.countDocuments({
            userId: req.user.id,
            status: 'completed'
        });
        const totalTasks = await Task.countDocuments({ userId: req.user.id });
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const userData = {
            patterns: user.patterns,
            todayTasksCount,
            completionRate
        };

        // Get AI response
        const aiResponse = await chatWithAI(message, userData);

        res.status(200).json({
            message: aiResponse,
            timestamp: new Date()
        });
    } catch (error) {
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