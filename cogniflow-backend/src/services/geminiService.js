const { GoogleGenerativeAI } = require('@google/generative-ai');

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

        const prompt = `Task: Extract productivity insights from a user's raw thought.
Role: Objective Data Analyst.
Constraint: Do not interpret beyond the text. If the user expresses a preference, accept it as fact.

User Context:
- Patterns: ${JSON.stringify(userContext.patterns)}
- Recent Tasks: ${userContext.recentTasksCount || 0}

User's Thought: "${thoughtContent}"

Analyze and return ONLY a JSON object (no markdown):
{
  "insights": [
    {
      "type": "energy|preference|frustration|habit",
      "signal": "brief insight description",
      "confidence": 0.0-1.0
    }
  ]
}

Focus strictly on work style preferences and energy blockers.`;

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
            signal: 'Manual review needed.',
            confidence: 0.5
        }];
    }
};


const generateSchedule = async (tasks, userPatterns) => {
    try {
        console.log('🤖 Generating AI schedule...');

        const prompt = `Role: Precision Scheduler.
Goal: Organize these tasks into a 7-day schedule.
Rule: Do exactly as the user says. If they provide 10 tasks, schedule all 10.
Suggestion Policy: If the load is inefficient, you may offer ONE alternative suggestion in the "warnings" field, but you must still fulfill the requested schedule first.

User Patterns:
- Peak hours: ${userPatterns.peakHours || [14, 15, 16]}
- Optimal count: ${userPatterns.optimalTaskCount || 3}
- Load tolerance: ${userPatterns.loadTolerance || 'medium'}

Tasks:
${JSON.stringify(tasks.map(t => ({
    id: t._id,
    title: t.title,
    difficulty: t.difficulty,
    priority: t.priority,
    duration: t.estimatedDuration
})), null, 2)}

Current Time: ${new Date().toISOString()}

Return ONLY JSON:
{
  "schedule": [
    {
      "taskId": "id",
      "scheduledFor": "ISO String",
      "scheduledEndTime": "ISO String",
      "reason": "Short reason"
    }
  ],
  "totalLoad": "light|optimal|heavy",
  "warnings": ["Suggest alternative ONLY once if capacity is exceeded"]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return parsed;
    } catch (error) {
        console.error('❌ Error generating schedule:', error.message);
        return { schedule: [], totalLoad: 'optimal', warnings: [error.message] };
    }
};


const chatWithAI = async (userMessage, userData) => {
    try {
        console.log('🤖 Chatting with AI...');

        const todayTasksList = userData.todayTasks?.map(t =>
            `- ${t.title} (${t.status})`
        ).join('\n') || 'None';

        const prompt = `You are the CogniFlow Assistant. Your primary directive is to be concise and compliant.

Interaction Rules:
1. DIRECT OBEDIENCE: If the user gives an instruction, follow it immediately. Do not argue.
2. ONE-TIME SUGGESTION: You may suggest an alternative approach ONLY once. If the user persists, do as they ask without further comment.
3. BREVITY: Limit responses to 2-3 sentences. No fluff or "I am here to help" introductions.

User Data:
- Completion Rate: ${userData.completionRate || 0}%
- Peak Hours: ${userData.patterns?.peakHours?.join(', ') || '2-4 PM'}
- Today's Tasks: ${todayTasksList}

User Question: "${userMessage}"

Acknowledge the data, fulfill the request, and keep it brief.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error('❌ Error in chat:', error.message);
        return "I'm having trouble connecting. Please try again.";
    }
};

module.exports = {
    processThought,
    generateSchedule,
    chatWithAI
};