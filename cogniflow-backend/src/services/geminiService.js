const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');

if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env file');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest'
});

const processThought = async (thoughtContent, userContext) => {
    try {
        console.log('🤖 Processing thought with AI...');

        const prompt = `You are analyzing a user's productivity thought to extract actionable insights.

User Context:
- Current patterns: ${JSON.stringify(userContext.patterns)}
- Recent tasks: ${userContext.recentTasksCount || 0} tasks

User's Thought: "${thoughtContent}"

Analyze this thought and extract insights. Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "insights": [
    {
      "type": "energy|preference|frustration|habit",
      "signal": "brief insight description",
      "confidence": 0.0-1.0
    }
  ]
}

Focus on:
- Energy levels and timing preferences
- Work style preferences
- Frustrations or blockers
- Habit patterns

Return at least 1-3 insights.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return parsed.insights || [];
    } catch (error) {
        console.error('❌ Error processing thought:', error.message);

        return [{
            type: 'preference',
            signal: 'Unable to process thought automatically. Manual review needed.',
            confidence: 0.5
        }];
    }
};

const generateSchedule = async (tasks, userPatterns) => {
    try {
        console.log('🤖 Generating AI schedule...');

        const prompt = `You are an intelligent scheduling assistant. Create an optimal schedule for these tasks.

User Patterns:
- Peak hours: ${userPatterns.peakHours || [14, 15, 16]}
- Optimal task count: ${userPatterns.optimalTaskCount || 3} tasks per day
- Load tolerance: ${userPatterns.loadTolerance || 'medium'}

Tasks to Schedule:
${JSON.stringify(tasks.map(t => ({
    id: t._id,
    title: t.title,
    difficulty: t.difficulty,
    priority: t.priority,
    estimatedDuration: t.estimatedDuration,
    deadline: t.deadline
})), null, 2)}

Current Date/Time: ${new Date().toISOString()}

Rules:
1. Schedule difficult tasks during peak hours: ${userPatterns.peakHours || [14, 15, 16]}
2. Respect load tolerance: user handles ${userPatterns.optimalTaskCount || 3} tasks optimally
3. Consider deadlines but prioritize human capacity
4. Leave buffer time between tasks
5. Don't overload - better to postpone than burn out
6. Schedule tasks within next 7 days
7. Don't schedule past midnight

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "schedule": [
    {
      "taskId": "actual task._id here",
      "scheduledFor": "2024-02-08T14:00:00.000Z",
      "scheduledEndTime": "2024-02-08T15:30:00.000Z",
      "reason": "Scheduled during peak hours for optimal focus"
    }
  ],
  "totalLoad": "light|optimal|heavy",
  "warnings": ["any concerns about the schedule"]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return parsed;
    } catch (error) {
        console.error('❌ Error generating schedule:', error.message);

        return {
            schedule: [],
            totalLoad: 'optimal',
            warnings: ['AI scheduling temporarily unavailable. Error: ' + error.message]
        };
    }
};

const chatWithAI = async (userMessage, userData, userId) => {
    try {
        console.log('🤖 Chatting with AI...');
        console.log('User message:', userMessage);

        // Build context strings
        const todayTasksList = userData.todayTasks?.map(t =>
            `- ${t.title} (${t.status}, ${t.scheduledFor ? new Date(t.scheduledFor).toLocaleTimeString() : 'not scheduled'})`
        ).join('\n') || 'No tasks today';

        const allTasksList = userData.allTasks?.slice(0, 20).map(t =>
            `- ID: ${t.id}, Title: "${t.title}", Status: ${t.status}, Scheduled: ${t.scheduledFor ? new Date(t.scheduledFor).toLocaleString() : 'Not scheduled'}, Deadline: ${t.deadline ? new Date(t.deadline).toLocaleString() : 'None'}, Priority: ${t.priority || 'medium'}, Difficulty: ${t.difficulty || 'medium'}`
        ).join('\n') || 'No tasks';

        const thoughtsList = userData.recentThoughts?.slice(0, 3).map(t =>
            `- "${t.content}" (${t.insights?.length || 0} insights)`
        ).join('\n') || 'No recent thoughts';

        const reflectionsList = userData.recentReflections?.map(r =>
            `- ${new Date(r.date).toLocaleDateString()}: Went well: ${r.wentWell?.substring(0, 50) || 'N/A'}, Felt heavy: ${r.feltHeavy?.substring(0, 50) || 'N/A'}`
        ).join('\n') || 'No recent reflections';

        const prompt = `You are CogniFlow's AI assistant with TASK MANAGEMENT capabilities.

User's Productivity Profile:
- Peak Performance Hours: ${userData.patterns?.peakHours?.join(', ') || '2-4 PM'}
- Optimal Daily Tasks: ${userData.patterns?.optimalTaskCount || 3}
- Load Tolerance: ${userData.patterns?.loadTolerance || 'medium'}
- Completion Rate: ${userData.completionRate || 0}%
- Consistency Streak: ${userData.patterns?.consistencyStreak || 0} days

Today's Tasks (${userData.todayTasksCount || 0}):
${todayTasksList}

All Tasks:
${allTasksList}

Recent Thoughts:
${thoughtsList}

Recent Reflections:
${reflectionsList}

User's Message: "${userMessage}"

TASK MANAGEMENT CAPABILITIES:
You can perform these actions:

1. CREATE TASK:
   - Extract: task name, deadline (optional), schedule time (optional)
   - Return: action: "create_task", data: { title, deadline, scheduledFor, priority, difficulty, estimatedDuration }

2. UPDATE TASK:
   - Find task by name/ID
   - Extract: what to update (deadline, name, schedule, status)
   - Return: action: "update_task", data: { taskId, updates: {...} }

3. DELETE TASK:
   - Find task by name
   - Return: action: "delete_task", data: { taskId, taskTitle }

4. LIST TASKS:
   - Filter: today/tomorrow/specific date
   - Return: action: "list_tasks", data: { filter, tasks: [...] }

5. ANSWER QUESTIONS:
   - For general questions, respond conversationally
   - Return: action: "chat", message: "your response"

RESPONSE FORMAT:
Return ONLY a JSON object (no markdown, no code blocks):

For task actions:
{
  "action": "create_task|update_task|delete_task|list_tasks",
  "message": "User-friendly confirmation message",
  "data": { /* action-specific data */ }
}

For chat:
{
  "action": "chat",
  "message": "Your conversational response"
}

EXAMPLES:

User: "Create a task called 'Finish report' due tomorrow at 2pm"
{
  "action": "create_task",
  "message": "I'll create a task 'Finish report' scheduled for tomorrow at 2 PM.",
  "data": {
    "title": "Finish report",
    "deadline": "2024-02-13T14:00:00.000Z",
    "scheduledFor": "2024-02-13T14:00:00.000Z",
    "priority": "medium",
    "difficulty": "medium",
    "estimatedDuration": 60
  }
}

User: "Mark 'Finish report' as completed"
{
  "action": "update_task",
  "message": "I'll mark 'Finish report' as completed.",
  "data": {
    "taskId": "find_by_title:Finish report",
    "updates": {
      "status": "completed"
    }
  }
}

User: "Delete the meeting task"
{
  "action": "delete_task",
  "message": "I'll delete the meeting task for you.",
  "data": {
    "taskId": "find_by_title:meeting"
  }
}

User: "What tasks do I have today?"
{
  "action": "list_tasks",
  "message": "Here are your tasks for today:",
  "data": {
    "filter": "today",
    "tasks": [/* filtered task list */]
  }
}

User: "What's my peak time?"
{
  "action": "chat",
  "message": "Your peak performance hours are 2-4 PM. That's when you complete tasks 40% faster!"
}

Now respond to the user's message.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('📄 Raw AI response:', text.substring(0, 300));

        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Execute task actions if needed
        if (parsed.action === 'create_task') {
            const taskData = {
                userId: userId,
                ...parsed.data,
                type: parsed.data.scheduledFor ? 'ai-scheduled' : 'manual'
            };
            const newTask = await Task.create(taskData);
            parsed.data.taskId = newTask._id;
            parsed.message += ` Task created successfully!`;
        }

        if (parsed.action === 'update_task') {
            let taskId = parsed.data.taskId;

            // If taskId is "find_by_title:TaskName", find the task
            if (typeof taskId === 'string' && taskId.startsWith('find_by_title:')) {
                const taskTitle = taskId.split('find_by_title:')[1];
                const task = await Task.findOne({
                    userId: userId,
                    title: { $regex: taskTitle, $options: 'i' }
                });
                if (task) {
                    taskId = task._id;
                } else {
                    parsed.message = `Sorry, I couldn't find a task matching "${taskTitle}".`;
                    parsed.action = 'chat';
                    return parsed;
                }
            }

            await Task.findByIdAndUpdate(taskId, parsed.data.updates);
            parsed.message += ` Task updated successfully!`;
        }

        if (parsed.action === 'delete_task') {
            let taskId = parsed.data.taskId;

            // If taskId is "find_by_title:TaskName", find the task
            if (typeof taskId === 'string' && taskId.startsWith('find_by_title:')) {
                const taskTitle = taskId.split('find_by_title:')[1];
                const task = await Task.findOne({
                    userId: userId,
                    title: { $regex: taskTitle, $options: 'i' }
                });
                if (task) {
                    await Task.findByIdAndDelete(task._id);
                    parsed.message += ` Task deleted successfully!`;
                } else {
                    parsed.message = `Sorry, I couldn't find a task matching "${taskTitle}".`;
                    parsed.action = 'chat';
                }
            } else {
                await Task.findByIdAndDelete(taskId);
                parsed.message += ` Task deleted successfully!`;
            }
        }

        if (parsed.action === 'list_tasks') {
            // Filter tasks based on the request
            const filter = parsed.data.filter;
            const allTasks = userData.allTasks;

            let filteredTasks = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (filter === 'today') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                filteredTasks = allTasks.filter(t => {
                    const taskDate = new Date(t.scheduledFor || t.deadline);
                    return taskDate >= today && taskDate < tomorrow;
                });
            } else if (filter === 'tomorrow') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dayAfter = new Date(tomorrow);
                dayAfter.setDate(dayAfter.getDate() + 1);
                filteredTasks = allTasks.filter(t => {
                    const taskDate = new Date(t.scheduledFor || t.deadline);
                    return taskDate >= tomorrow && taskDate < dayAfter;
                });
            } else {
                filteredTasks = allTasks.filter(t => t.scheduledFor || t.deadline);
            }

            parsed.data.tasks = filteredTasks;
        }

        console.log('✅ AI action:', parsed.action);

        return parsed;
    } catch (error) {
        console.error('❌ Error in chat:', error.message);
        console.error('Full error:', error);

        return {
            action: 'chat',
            message: "I'm having trouble connecting right now. Please try again in a moment.",
            data: {}
        };
    }
};

module.exports = {
    processThought,
    generateSchedule,
    chatWithAI
};