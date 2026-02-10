const User = require('../models/User');
const Task = require('../models/Task');
const Reflection = require('../models/Reflection');

const getInsights = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const completedTasks = await Task.countDocuments({
            userId: req.user.id,
            status: 'completed'
        });

        const totalTasks = await Task.countDocuments({
            userId: req.user.id
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const insights = {
            peakHours: user.patterns.peakHours,
            completionRate: completionRate,
            optimalTaskCount: user.patterns.optimalTaskCount,
            loadTolerance: user.patterns.loadTolerance,
            consistencyStreak: user.patterns.consistencyStreak
        };

        res.status(200).json(insights);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPatterns = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const recentReflections = await Reflection.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(7);

        const patterns = {
            peakHours: user.patterns.peakHours,
            optimalTaskCount: user.patterns.optimalTaskCount,
            loadTolerance: user.patterns.loadTolerance,
            consistencyStreak: user.patterns.consistencyStreak,
            recentReflections: recentReflections.length,
            lastUpdated: user.patterns.lastUpdated
        };

        res.status(200).json(patterns);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getInsights,
    getPatterns
};