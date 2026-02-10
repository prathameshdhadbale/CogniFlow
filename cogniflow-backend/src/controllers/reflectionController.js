const Reflection = require('../models/Reflection');

const getReflections = async (req, res) => {
    try {
        const reflections = await Reflection.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(30);

        res.status(200).json(reflections);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTodayReflection = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reflection = await Reflection.findOne({
            userId: req.user.id,
            date: { $gte: today }
        });

        if (!reflection) {
            return res.status(404).json({ message: 'No reflection for today' });
        }

        res.status(200).json(reflection);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createReflection = async (req, res) => {
    try {
        const { date, wentWell, feltHeavy, wasOverloaded, scheduleAccuracy, completedTasks, missedTasks } = req.body;

        const reflectionDate = date ? new Date(date) : new Date();
        reflectionDate.setHours(0, 0, 0, 0);

        const existingReflection = await Reflection.findOne({
            userId: req.user.id,
            date: reflectionDate
        });

        if (existingReflection) {
            return res.status(400).json({ message: 'Reflection already exists for this date' });
        }

        const reflection = await Reflection.create({
            userId: req.user.id,
            date: reflectionDate,
            wentWell,
            feltHeavy,
            wasOverloaded,
            scheduleAccuracy,
            completedTasks: completedTasks || [],
            missedTasks: missedTasks || [],
            insights: []
        });

        res.status(201).json(reflection);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getReflections,
    getTodayReflection,
    createReflection
};