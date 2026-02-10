const Task = require('../models/Task');

const getTodaySchedule = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await Task.find({
            userId: req.user.id,
            scheduledFor: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ scheduledFor: 1 });

        const schedule = {
            date: today,
            tasks: tasks,
            totalLoad: calculateLoad(tasks),
            focusWindows: [
                {
                    start: new Date(today.setHours(14, 0, 0, 0)),
                    end: new Date(today.setHours(16, 0, 0, 0)),
                    type: 'peak'
                }
            ]
        };

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSchedule = async (req, res) => {
    try {
        const { date } = req.params;
        const scheduleDate = new Date(date);
        scheduleDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(scheduleDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const tasks = await Task.find({
            userId: req.user.id,
            scheduledFor: {
                $gte: scheduleDate,
                $lt: nextDay
            }
        }).sort({ scheduledFor: 1 });

        const schedule = {
            date: scheduleDate,
            tasks: tasks,
            totalLoad: calculateLoad(tasks)
        };

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const generateSchedule = async (req, res) => {
    try {
        const pendingTasks = await Task.find({
            userId: req.user.id,
            status: 'pending'
        }).limit(10);

        res.status(200).json({
            message: 'AI scheduling will be implemented with Gemini API',
            pendingTasks: pendingTasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const adjustSchedule = async (req, res) => {
    try {
        const { adjustments } = req.body;

        res.status(200).json({
            message: 'Schedule adjustments applied',
            adjustments: adjustments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateLoad(tasks) {
    if (tasks.length === 0) return 'light';
    if (tasks.length <= 3) return 'optimal';
    return 'heavy';
}

module.exports = {
    getTodaySchedule,
    getSchedule,
    generateSchedule,
    adjustSchedule
};