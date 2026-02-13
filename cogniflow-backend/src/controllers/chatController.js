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

        // Get all tasks for context and potential actions
        const allTasks = await Task.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        // Get today's tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasks = allTasks.filter(task => {
            if (task.scheduledFor) {
                const scheduledDate = new Date(task.scheduledFor);
                return scheduledDate >= today && scheduledDate < tomorrow;
            }
            return false;
        });

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
            allTasks: allTasks.map(t => ({
                id: t._id.toString(),
                title: t.title,
                status: t.status,
                scheduledFor: t.scheduledFor,
                deadline: t.deadline,
                priority: t.priority,
                difficulty: t.difficulty,
                estimatedDuration: t.estimatedDuration
            })),
            todayTasks: todayTasks.map(t => ({
                title: t.title,
                status: t.status,
                scheduledFor: t.scheduledFor,
                difficulty: t.difficulty,
                priority: t.priority
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

        // Get AI response with task management capabilities
        const aiResponse = await chatWithAI(message, userData, req.user.id);

        res.status(200).json({
            message: aiResponse.message,
            action: aiResponse.action,
            data: aiResponse.data,
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