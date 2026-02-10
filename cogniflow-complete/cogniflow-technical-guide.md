# CogniFlow - Complete Technical Architecture & Implementation Guide

## Table of Contents
1. Backend Architecture
2. Database Design
3. React Frontend Architecture
4. AI Integration (Claude API)
5. Personal Learning System
6. Scheduling Intelligence Engine
7. Step-by-Step Implementation Roadmap

---

## 1. BACKEND ARCHITECTURE

### Tech Stack
```
Node.js + Express.js
MongoDB (for flexible data) + PostgreSQL (for structured scheduling)
JWT Authentication
Anthropic Claude API
```

### Project Structure
```
cogniflow-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # DB connections
│   │   ├── claude.js             # Claude API config
│   │   └── jwt.js                # Auth config
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Task.js               # Task schema
│   │   ├── Thought.js            # Thought schema
│   │   ├── Reflection.js         # Reflection schema
│   │   ├── Pattern.js            # User patterns/insights
│   │   └── Schedule.js           # Schedule entries
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── thoughtController.js
│   │   ├── reflectionController.js
│   │   ├── scheduleController.js
│   │   ├── insightController.js
│   │   └── chatController.js
│   ├── services/
│   │   ├── claudeService.js      # Claude API integration
│   │   ├── schedulingEngine.js   # Core scheduling logic
│   │   ├── patternAnalyzer.js    # Learn user patterns
│   │   ├── loadCalculator.js     # Cognitive load calculation
│   │   └── insightGenerator.js   # Generate insights
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── thoughts.js
│   │   ├── reflections.js
│   │   ├── schedule.js
│   │   ├── insights.js
│   │   └── chat.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js
│   └── utils/
│       ├── dateHelpers.js
│       ├── loadHelpers.js
│       └── promptBuilder.js      # Build prompts for Claude
└── server.js
```

---

## 2. DATABASE DESIGN

### MongoDB Collections (Flexible Data)

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  preferences: {
    timezone: String,
    workHoursStart: Number,  // 9 (for 9 AM)
    workHoursEnd: Number,     // 18 (for 6 PM)
    notificationsEnabled: Boolean
  },
  patterns: {
    peakHours: [Number],      // [14, 15, 16] for 2-4 PM
    optimalTaskCount: Number,  // 3
    loadTolerance: String,     // "medium"
    averageTaskDuration: Number,
    burnoutFrequency: Number,
    consistencyStreak: Number,
    lastUpdated: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  type: String,              // "ai-scheduled" or "manual"
  status: String,            // "pending", "scheduled", "in-progress", "completed", "postponed"
  priority: String,          // "high", "medium", "low"
  difficulty: String,        // "light", "medium", "heavy"
  estimatedDuration: Number, // minutes
  actualDuration: Number,    // minutes (filled after completion)
  deadline: Date,            // for manual tasks
  scheduledFor: Date,        // when AI schedules it
  scheduledEndTime: Date,
  completedAt: Date,
  postponedCount: Number,
  createdFrom: String,       // "manual", "thought", "reflection"
  relatedThoughtId: ObjectId,
  schedulingReason: String,  // Why AI scheduled it here (for explainability)
  createdAt: Date,
  updatedAt: Date
}
```

#### Thoughts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  content: String,           // Raw thought text
  processedInsights: [{
    type: String,            // "energy", "preference", "frustration", "habit"
    signal: String,          // Extracted signal
    confidence: Number       // 0-1
  }],
  affectedScheduling: Boolean,
  usedInSchedule: Date,
  createdAt: Date
}
```

#### Reflections Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  wentWell: String,
  feltHeavy: String,
  wasOverloaded: String,     // "no", "slight", "yes"
  scheduleAccuracy: String,  // "very", "mostly", "somewhat", "not"
  completedTasks: [ObjectId],
  missedTasks: [ObjectId],
  insights: [{
    type: String,
    value: String
  }],
  createdAt: Date
}
```

#### Schedule Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  tasks: [{
    taskId: ObjectId,
    startTime: Date,
    endTime: Date,
    schedulingScore: Number,  // Confidence in this schedule
    factors: {
      peakHourMatch: Boolean,
      loadBalance: String,
      deadlineProximity: Number,
      historicalSuccess: Number
    }
  }],
  totalLoad: String,         // "light", "optimal", "heavy"
  focusWindows: [{
    start: Date,
    end: Date,
    type: String            // "peak", "regular"
  }],
  createdAt: Date
}
```

### PostgreSQL Tables (Structured Analytics)

#### pattern_history
```sql
CREATE TABLE pattern_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(24) NOT NULL,
  date DATE NOT NULL,
  hour_of_day INTEGER,
  tasks_completed INTEGER,
  tasks_postponed INTEGER,
  avg_completion_time INTEGER,
  load_level VARCHAR(20),
  user_reported_energy VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### scheduling_decisions
```sql
CREATE TABLE scheduling_decisions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(24) NOT NULL,
  task_id VARCHAR(24) NOT NULL,
  scheduled_time TIMESTAMP,
  decision_factors JSONB,  -- Store all factors that influenced decision
  user_followed BOOLEAN,
  outcome VARCHAR(50),     -- "completed", "postponed", "modified"
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. REACT FRONTEND ARCHITECTURE

### Project Structure
```
cogniflow-frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoadStatus.jsx
│   │   │   ├── FocusWindow.jsx
│   │   │   └── TaskPreview.jsx
│   │   ├── Tasks/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskDetail.jsx
│   │   ├── Thoughts/
│   │   │   ├── ThoughtInput.jsx
│   │   │   └── ThoughtList.jsx
│   │   ├── Reflections/
│   │   │   ├── ReflectionForm.jsx
│   │   │   └── ReflectionHistory.jsx
│   │   ├── Insights/
│   │   │   ├── InsightCards.jsx
│   │   │   └── PatternDisplay.jsx
│   │   └── Chat/
│   │       ├── ChatInterface.jsx
│   │       ├── MessageBubble.jsx
│   │       └── SuggestedQuestions.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── TasksPage.jsx
│   │   ├── ThoughtsPage.jsx
│   │   ├── ReflectionsPage.jsx
│   │   ├── InsightsPage.jsx
│   │   └── ChatPage.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── TaskContext.jsx
│   │   └── ScheduleContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   ├── useSchedule.js
│   │   └── useChat.js
│   ├── services/
│   │   ├── api.js          # Axios instance
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── thoughts.js
│   │   ├── reflections.js
│   │   ├── schedule.js
│   │   └── chat.js
│   ├── utils/
│   │   ├── dateFormat.js
│   │   ├── loadCalculator.js
│   │   └── constants.js
│   └── App.jsx
└── package.json
```

### Key Libraries
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "react-query": "^3.x",
    "zustand": "^4.x",          // State management
    "date-fns": "^2.x",         // Date utilities
    "framer-motion": "^10.x",   // Animations
    "react-hot-toast": "^2.x"   // Notifications
  }
}
```

---

## 4. AI INTEGRATION (CLAUDE API)

### Why Claude API?
- **Best for understanding context**: Excellent at processing unstructured thoughts
- **Long context window**: Can analyze entire user history
- **Reasoning capability**: Makes intelligent scheduling decisions
- **Explainability**: Can explain why it made certain decisions

### Model Selection
**Use: Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`)
- Best balance of intelligence and speed
- Perfect for real-time chat and scheduling
- Cost-effective for production

### Setup

#### 1. Install SDK
```bash
npm install @anthropic-ai/sdk
```

#### 2. Claude Service (src/services/claudeService.js)
```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

class ClaudeService {
  
  // Process user thought and extract insights
  async processThought(thought, userContext) {
    const prompt = `You are analyzing a user's productivity thought to extract actionable insights.

User Context:
- Current patterns: ${JSON.stringify(userContext.patterns)}
- Recent tasks: ${JSON.stringify(userContext.recentTasks)}

User's Thought: "${thought}"

Extract:
1. Energy signals (tired, energized, peak times mentioned)
2. Preference signals (work style, timing preferences)
3. Frustration signals (what's not working)
4. Task-related signals (specific tasks mentioned)

Return as JSON:
{
  "insights": [
    {
      "type": "energy|preference|frustration|task",
      "signal": "specific insight",
      "confidence": 0.0-1.0,
      "actionable": "what to adjust in scheduling"
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return JSON.parse(message.content[0].text);
  }

  // Generate intelligent schedule
  async generateSchedule(tasks, userPatterns, date) {
    const prompt = `You are an intelligent scheduling system that understands human behavior.

User Patterns:
${JSON.stringify(userPatterns, null, 2)}

Tasks to Schedule:
${JSON.stringify(tasks, null, 2)}

Date: ${date}

Rules:
1. Schedule difficult tasks during peak hours: ${userPatterns.peakHours}
2. Respect load tolerance: ${userPatterns.loadTolerance}
3. Optimal task count: ${userPatterns.optimalTaskCount}
4. Consider deadlines but prioritize human capacity
5. Leave buffer time between tasks
6. Avoid overload - it's better to postpone than burn out

Return a schedule as JSON:
{
  "schedule": [
    {
      "taskId": "...",
      "startTime": "ISO date",
      "endTime": "ISO date",
      "reason": "Why scheduled here",
      "confidence": 0.0-1.0
    }
  ],
  "warnings": ["Any concerns about overload, tight deadlines, etc."],
  "totalLoad": "light|optimal|heavy"
}`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return JSON.parse(message.content[0].text);
  }

  // Chat with context
  async chat(userMessage, conversationHistory, userData) {
    const systemPrompt = `You are CogniFlow's assistant. You help users understand their productivity patterns and scheduling decisions.

User Data:
- Patterns: ${JSON.stringify(userData.patterns)}
- Today's Schedule: ${JSON.stringify(userData.todaySchedule)}
- Recent Tasks: ${JSON.stringify(userData.recentTasks)}

Guidelines:
1. Be concise and helpful
2. Always reference the user's actual data
3. Explain scheduling decisions clearly
4. Be empathetic about workload concerns
5. Suggest adjustments when asked
6. Help the user understand themselves better

Respond naturally and conversationally.`;

    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    messages.push({
      role: 'user',
      content: userMessage
    });

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    return message.content[0].text;
  }

  // Generate insights from reflections
  async generateInsights(reflections, patterns, tasks) {
    const prompt = `Analyze this user's productivity data and generate insights.

Recent Reflections:
${JSON.stringify(reflections, null, 2)}

Current Patterns:
${JSON.stringify(patterns, null, 2)}

Task Completion Data:
${JSON.stringify(tasks, null, 2)}

Generate insights about:
1. Consistency patterns
2. Peak productivity times
3. Load tolerance
4. Planning vs execution accuracy
5. Burnout indicators
6. Successful task types/times

Return as JSON:
{
  "insights": [
    {
      "category": "consistency|peak-time|load|planning|energy",
      "title": "Short insight title",
      "description": "Detailed explanation",
      "actionable": "What the user should do with this info"
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return JSON.parse(message.content[0].text);
  }
}

module.exports = new ClaudeService();
```

---

## 5. PERSONAL LEARNING SYSTEM

### How It Learns From User

#### Data Collection Points
```javascript
// 1. Task Completion Tracking
{
  taskId: "...",
  scheduledTime: "2:00 PM",
  actualStartTime: "2:15 PM",      // 15 min late
  estimatedDuration: 90,            // minutes
  actualDuration: 75,               // completed faster!
  wasPostponed: false,
  timeOfDay: 14,                    // 2 PM
  dayOfWeek: 4,                     // Thursday
  userEnergy: "high",               // from reflection
  completed: true
}

// 2. Thought Processing
{
  thought: "I work best late at night",
  extractedSignal: "preference:night-work",
  weight: 0.8,
  appliedToScheduling: true
}

// 3. Reflection Analysis
{
  overloadReported: "slight",
  tasksScheduled: 4,
  tasksCompleted: 3,
  feltHeavy: "Documentation took longer than expected",
  learnings: [
    "Reduce documentation task estimate",
    "User's capacity is 3 tasks not 4"
  ]
}
```

#### Pattern Detection Algorithm

```javascript
// src/services/patternAnalyzer.js

class PatternAnalyzer {
  
  async analyzePeakHours(userId) {
    // Get all completed tasks
    const tasks = await Task.find({
      userId,
      status: 'completed',
      actualDuration: { $exists: true }
    });

    // Group by hour of day
    const hourlyPerformance = {};
    
    tasks.forEach(task => {
      const hour = new Date(task.scheduledFor).getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = {
          count: 0,
          totalDuration: 0,
          avgSpeed: 0
        };
      }
      
      hourlyPerformance[hour].count++;
      hourlyPerformance[hour].totalDuration += task.actualDuration;
      
      // Calculate speed: estimated vs actual
      const speed = task.estimatedDuration / task.actualDuration;
      hourlyPerformance[hour].avgSpeed = 
        (hourlyPerformance[hour].avgSpeed * (hourlyPerformance[hour].count - 1) + speed) 
        / hourlyPerformance[hour].count;
    });

    // Find hours with best performance (fastest completion)
    const peakHours = Object.entries(hourlyPerformance)
      .sort((a, b) => b[1].avgSpeed - a[1].avgSpeed)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return peakHours;
  }

  async calculateLoadTolerance(userId) {
    // Get reflections
    const reflections = await Reflection.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    // Count overload reports vs task counts
    const loadData = reflections.map(r => ({
      taskCount: r.completedTasks.length + r.missedTasks.length,
      wasOverloaded: r.wasOverloaded !== 'no'
    }));

    // Find the task count threshold
    const overloadThreshold = loadData
      .filter(d => d.wasOverloaded)
      .reduce((sum, d) => sum + d.taskCount, 0) / 
      loadData.filter(d => d.wasOverloaded).length;

    const optimalCount = Math.floor(overloadThreshold) - 1;

    return {
      optimalTaskCount: optimalCount,
      loadTolerance: optimalCount <= 2 ? 'low' : 
                     optimalCount <= 4 ? 'medium' : 'high'
    };
  }

  async detectBurnoutRisk(userId) {
    const recentReflections = await Reflection.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    const overloadDays = recentReflections.filter(
      r => r.wasOverloaded !== 'no'
    ).length;

    const consecutiveOverload = this.findConsecutiveOverload(recentReflections);

    return {
      riskLevel: consecutiveOverload >= 3 ? 'high' :
                 overloadDays >= 4 ? 'medium' : 'low',
      daysOverloaded: overloadDays,
      consecutiveDays: consecutiveOverload
    };
  }

  async updateUserPatterns(userId) {
    const peakHours = await this.analyzePeakHours(userId);
    const loadTolerance = await this.calculateLoadTolerance(userId);
    const burnoutRisk = await this.detectBurnoutRisk(userId);
    
    // Update user patterns
    await User.findByIdAndUpdate(userId, {
      'patterns.peakHours': peakHours,
      'patterns.optimalTaskCount': loadTolerance.optimalTaskCount,
      'patterns.loadTolerance': loadTolerance.loadTolerance,
      'patterns.burnoutFrequency': burnoutRisk.riskLevel,
      'patterns.lastUpdated': new Date()
    });

    return {
      peakHours,
      loadTolerance,
      burnoutRisk
    };
  }
}

module.exports = new PatternAnalyzer();
```

#### Weight-Based Learning

```javascript
// Scheduling weights are adjusted based on user behavior

const schedulingWeights = {
  peakHourMatch: 1.5,        // Starts at 1.5
  deadlineProximity: 1.2,
  taskDifficulty: 1.0,
  userPreference: 1.0,       // Increases as we learn
  historicalSuccess: 0.5     // Increases with data
};

// After each task completion:
function adjustWeights(task, outcome) {
  if (outcome === 'completed-on-time') {
    if (task.wasDuringPeakHour) {
      weights.peakHourMatch *= 1.05;  // Increase confidence
    }
    if (task.matchedUserPreference) {
      weights.userPreference *= 1.1;
    }
  } else if (outcome === 'postponed') {
    if (task.wasDuringPeakHour === false) {
      weights.peakHourMatch *= 1.1;  // Should prioritize peak hours more
    }
  }
}
```

---

## 6. SCHEDULING INTELLIGENCE ENGINE

### Core Algorithm

```javascript
// src/services/schedulingEngine.js

class SchedulingEngine {
  
  async scheduleTask(task, userId) {
    // Get user patterns
    const user = await User.findById(userId);
    const patterns = user.patterns;
    
    // Get existing schedule
    const existingSchedule = await Schedule.findOne({
      userId,
      date: { 
        $gte: startOfDay(new Date()),
        $lte: endOfDay(new Date())
      }
    });

    // Calculate optimal time slot
    const optimalSlot = this.findOptimalSlot({
      task,
      patterns,
      existingSchedule,
      constraints: {
        workHoursStart: user.preferences.workHoursStart,
        workHoursEnd: user.preferences.workHoursEnd
      }
    });

    return optimalSlot;
  }

  findOptimalSlot(config) {
    const { task, patterns, existingSchedule, constraints } = config;
    
    // Generate candidate time slots
    const candidates = this.generateTimeSlots(
      constraints.workHoursStart,
      constraints.workHoursEnd,
      task.estimatedDuration,
      existingSchedule
    );

    // Score each candidate
    const scoredCandidates = candidates.map(slot => ({
      slot,
      score: this.scoreTimeSlot(slot, task, patterns),
      reason: this.explainScore(slot, task, patterns)
    }));

    // Return best slot
    return scoredCandidates.sort((a, b) => b.score - a.score)[0];
  }

  scoreTimeSlot(slot, task, patterns) {
    let score = 0;
    const hour = slot.start.getHours();

    // Peak hour bonus
    if (patterns.peakHours.includes(hour)) {
      score += 50;
    }

    // Task difficulty matching
    if (task.difficulty === 'heavy' && patterns.peakHours.includes(hour)) {
      score += 30;
    } else if (task.difficulty === 'light' && !patterns.peakHours.includes(hour)) {
      score += 20;
    }

    // Deadline proximity
    if (task.deadline) {
      const daysUntilDeadline = differenceInDays(task.deadline, new Date());
      if (daysUntilDeadline <= 1) score += 40;
      else if (daysUntilDeadline <= 3) score += 20;
    }

    // Load balance (penalize if already have many tasks)
    const tasksInWindow = this.countTasksInWindow(slot);
    score -= tasksInWindow * 10;

    return score;
  }

  explainScore(slot, task, patterns) {
    const reasons = [];
    const hour = slot.start.getHours();

    if (patterns.peakHours.includes(hour)) {
      reasons.push("Scheduled during your peak productivity hours");
    }

    if (task.difficulty === 'heavy' && patterns.peakHours.includes(hour)) {
      reasons.push("Heavy task matched with high-energy time");
    }

    if (task.deadline) {
      const days = differenceInDays(task.deadline, new Date());
      reasons.push(`${days} days until deadline`);
    }

    return reasons.join('; ');
  }

  // AI-powered scheduling using Claude
  async scheduleWithAI(tasks, userId) {
    const user = await User.findById(userId);
    const claudeService = require('./claudeService');
    
    // Get AI-generated schedule
    const aiSchedule = await claudeService.generateSchedule(
      tasks,
      user.patterns,
      new Date()
    );

    // Save schedule with AI reasoning
    const schedule = new Schedule({
      userId,
      date: new Date(),
      tasks: aiSchedule.schedule.map(s => ({
        taskId: s.taskId,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
        schedulingScore: s.confidence,
        factors: {
          aiReasoning: s.reason
        }
      })),
      totalLoad: aiSchedule.totalLoad
    });

    await schedule.save();
    return schedule;
  }
}

module.exports = new SchedulingEngine();
```

---

## 7. STEP-BY-STEP IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
```
✅ Setup backend project structure
✅ Configure MongoDB and PostgreSQL
✅ Create User, Task, Thought models
✅ Build authentication (JWT)
✅ Setup Claude API integration
✅ Create basic API endpoints:
   - POST /auth/register
   - POST /auth/login
   - GET /tasks
   - POST /tasks
   - PUT /tasks/:id
   - DELETE /tasks/:id
```

### Phase 2: Core Scheduling (Week 3-4)
```
✅ Build scheduling engine (rule-based first)
✅ Implement pattern analyzer
✅ Create Schedule model
✅ API endpoints:
   - GET /schedule/today
   - POST /schedule/generate
   - PUT /schedule/adjust
✅ Basic load calculation
✅ Time slot scoring algorithm
```

### Phase 3: AI Integration (Week 5-6)
```
✅ Integrate Claude for thought processing
✅ Integrate Claude for scheduling
✅ Build prompt templates
✅ API endpoints:
   - POST /thoughts (with AI processing)
   - POST /chat
   - POST /schedule/ai-generate
✅ Test AI responses
✅ Add explainability layer
```

### Phase 4: Learning System (Week 7-8)
```
✅ Implement pattern detection
✅ Build reflection analyzer
✅ Create insight generator
✅ Weight adjustment system
✅ API endpoints:
   - POST /reflections
   - GET /insights
   - GET /patterns
✅ Historical data analysis
```

### Phase 5: React Frontend (Week 9-10)
```
✅ Convert HTML to React components
✅ Setup routing
✅ Implement state management
✅ Connect to backend APIs
✅ Add real-time updates
✅ Build chat interface
✅ Add animations
```

### Phase 6: Polish & Testing (Week 11-12)
```
✅ Error handling
✅ Loading states
✅ Responsive design fixes
✅ Performance optimization
✅ User testing
✅ Bug fixes
✅ Documentation
```

---

## API ENDPOINTS SUMMARY

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Tasks:
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PUT    /api/tasks/:id/complete

Thoughts:
GET    /api/thoughts
POST   /api/thoughts (triggers AI processing)
GET    /api/thoughts/:id

Reflections:
GET    /api/reflections
POST   /api/reflections
GET    /api/reflections/today

Schedule:
GET    /api/schedule/today
GET    /api/schedule/:date
POST   /api/schedule/generate
PUT    /api/schedule/adjust

Insights:
GET    /api/insights
GET    /api/insights/patterns

Chat:
POST   /api/chat/message
GET    /api/chat/history
```

---

## ENVIRONMENT VARIABLES

```env
# Backend (.env)
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/cogniflow
POSTGRES_URI=postgresql://localhost:5432/cogniflow

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

---

## COST ESTIMATION (Claude API)

**Claude 3.5 Sonnet Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Expected Usage per User per Day:**
- Thought processing: ~5 requests × 500 tokens = 2,500 tokens
- Scheduling: 2 requests × 2,000 tokens = 4,000 tokens
- Chat: ~10 messages × 800 tokens = 8,000 tokens
- Insights: 1 request × 3,000 tokens = 3,000 tokens

**Total: ~17,500 tokens/day**

**Monthly cost per user:** ~$0.50-1.00
**For 100 users:** ~$50-100/month

Very affordable for production!

---

## NEXT STEPS

1. **Create Backend**
   ```bash
   mkdir cogniflow-backend
   cd cogniflow-backend
   npm init -y
   npm install express mongoose pg @anthropic-ai/sdk jsonwebtoken bcryptjs
   ```

2. **Get Claude API Key**
   - Sign up at console.anthropic.com
   - Generate API key
   - Add to .env file

3. **Start Building**
   - Begin with Phase 1 (Foundation)
   - Test each endpoint
   - Move to next phase

Would you like me to create the initial backend code files to get you started?
