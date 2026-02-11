require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('--- Cogniflow Backend Diagnostic (India 2026) ---');
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key missing in .env");

        const genAI = new GoogleGenerativeAI(apiKey);

        /** * MODEL SELECTION FOR 2026 FREE TIER:
         * 1. gemini-2.5-flash-lite (Best for free tier / High quota)
         * 2. gemini-2.5-flash (Standard)
         * 3. gemini-2.0-flash (Legacy 2.0)
         */
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        console.log('Model: gemini-2.5-flash-lite');
        console.log('Sending request...');

        const result = await model.generateContent("Hello from India! Confirm if you are active.");
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ Response:', text);
        console.log('✅ Status: Backend successfully connected to Gemini 2.5');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('429')) {
            console.log('💡 Tip: You hit the rate limit. Wait 30 seconds or use "gemini-2.5-flash-lite" for higher limits.');
        } else if (error.message.includes('404')) {
            console.log('💡 Tip: That model name is retired. Use "gemini-2.5-flash-lite".');
        }
    }
}

testGemini();