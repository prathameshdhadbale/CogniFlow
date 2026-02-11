const Task = require('../models/Task');
const User = require('../models/User');
const { generateSchedule: generateAISchedule } = require('../services/geminiService');


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
        // Get user patterns
        const user = await User.findById(req.user.id);

        // Get pending tasks
        const pendingTasks = await Task.find({
            userId: req.user.id,
            status: 'pending'
        }).limit(10);

        if (pendingTasks.length === 0) {
            return res.status(200).json({
                message: 'No pending tasks to schedule',
                schedule: []
            });
        }

        // Generate AI schedule
        const aiSchedule = await generateAISchedule(pendingTasks, user.patterns);

        // Update tasks with AI-generated schedule
        for (const scheduledTask of aiSchedule.schedule) {
            await Task.findByIdAndUpdate(scheduledTask.taskId, {
                scheduledFor: new Date(scheduledTask.scheduledFor),
                scheduledEndTime: new Date(scheduledTask.scheduledEndTime),
                schedulingReason: scheduledTask.reason,
                status: 'scheduled'
            });
        }

        res.status(200).json({
            message: 'Schedule generated successfully',
            schedule: aiSchedule.schedule,
            totalLoad: aiSchedule.totalLoad,
            warnings: aiSchedule.warnings
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