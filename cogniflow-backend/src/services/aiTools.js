const Task = require('../models/Task');
const User = require('../models/User');

const aiTools = {
    // 1 & 2: Create or Update Task
    // This handles both creation and updates by checking for existing tasks
    upsertTask: async ({ name, deadline, scheduledFor, status, userId, actionType }) => {
        if (actionType === 'update') {
            const task = await Task.findOneAndUpdate(
                { title: new RegExp(name, 'i'), userId },
                {
                    ...(deadline && { deadline }),
                    ...(scheduledFor && { scheduledFor }),
                    ...(status && { status }),
                    ...(name && { title: name })
                },
                { new: true }
            );
            return task ? { success: true, task } : { success: false, message: "Task not found" };
        }

        const newTask = await Task.create({
            title: name,
            deadline,
            scheduledFor,
            userId,
            status: status || 'pending',
            type: 'manual'
        });
        return { success: true, task: newTask };
    },

    // 3: Delete Task by Name
    deleteTaskByName: async ({ name, userId }) => {
        const result = await Task.deleteOne({ title: new RegExp(name, 'i'), userId });
        return result.deletedCount > 0
            ? { success: true, message: `Deleted ${name}` }
            : { success: false, message: "Task not found" };
    },

    // 4: List Tasks by Date
    listTasksByDate: async ({ dateQuery, userId }) => {
        let start = new Date();
        if (dateQuery === 'tomorrow') start.setDate(start.getDate() + 1);
        else if (dateQuery !== 'today') start = new Date(dateQuery);

        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const tasks = await Task.find({
            userId,
            scheduledFor: { $gte: start, $lte: end }
        }).sort({ scheduledFor: 1 });

        return { success: true, count: tasks.length, tasks };
    }
};

module.exports = aiTools;