const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env file');
}

if (!process.env.GEMINI_MODEL) {
    console.warn('⚠️ GEMINI_MODEL not set, using default: gemini-1.5-pro');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' 
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
        
        console.log('📄 Raw AI response:', text);
        
        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        console.log('✅ Parsed insights:', parsed.insights);
        
        return parsed.insights || [];
    } catch (error) {
        console.error('❌ Error processing thought:', error.message);
        console.error('Full error:', error);
        
        // Return fallback insights
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
${JSON.stringify(userPatterns, null, 2)}

Tasks to Schedule:
${JSON.stringify(tasks, null, 2)}

Rules:
1. Schedule difficult tasks during peak hours: ${userPatterns.peakHours || [14, 15, 16]}
2. Respect load tolerance: user handles ${userPatterns.optimalTaskCount || 3} tasks optimally
3. Consider deadlines but prioritize human capacity
4. Leave buffer time between tasks
5. Don't overload - better to postpone than burn out

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "schedule": [
    {
      "taskId": "task._id here",
      "scheduledFor": "2024-02-08T14:00:00Z",
      "scheduledEndTime": "2024-02-08T15:30:00Z",
      "reason": "Why scheduled here"
    }
  ],
  "totalLoad": "light|optimal|heavy",
  "warnings": ["any concerns"]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('📄 Raw AI schedule response:', text);
        
        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        console.log('✅ Generated schedule:', parsed);
        
        return parsed;
    } catch (error) {
        console.error('❌ Error generating schedule:', error.message);
        console.error('Full error:', error);
        
        return {
            schedule: [],
            totalLoad: 'optimal',
            warnings: ['AI scheduling temporarily unavailable. Error: ' + error.message]
        };
    }
};

const chatWithAI = async (userMessage, userData) => {
    try {
        console.log('🤖 Chatting with AI...');
        console.log('User message:', userMessage);
        
        const prompt = `You are CogniFlow's assistant helping users understand their productivity.

User Data:
- Patterns: ${JSON.stringify(userData.patterns)}
- Today's Tasks: ${userData.todayTasksCount || 0} tasks
- Recent Performance: ${userData.completionRate || 'N/A'}%

User Question: "${userMessage}"

Guidelines:
1. Be concise and helpful
2. Reference user's actual data
3. Explain scheduling decisions clearly
4. Be empathetic about workload
5. Suggest actionable improvements

Respond naturally and conversationally in 2-3 sentences.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ AI response:', text);
        
        return text;
    } catch (error) {
        console.error('❌ Error in chat:', error.message);
        console.error('Full error:', error);
        
        return "I'm having trouble connecting right now. Please try again in a moment. Error: " + error.message;
    }
};

module.exports = {
    processThought,
    generateSchedule,
    chatWithAI
};