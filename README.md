
# CogniFlow

> An AI-powered productivity and scheduling system that goes beyond a simple to-do list.  
> CogniFlow analyzes your work patterns, energy levels, and task complexity to build an optimal daily workflow using Gemini AI.

---

## What it does

Most productivity tools just store your tasks. CogniFlow thinks about them. It matches difficult tasks to your peak performance hours, extracts actionable insights from your raw thoughts, and lets you manage everything through a conversational AI assistant — in plain English.

---

## Features

- **AI Schedule Generator** — Gemini AI analyzes your tasks and energy patterns to produce an optimized daily schedule
- **Thought Processing** — Write raw thoughts, AI extracts habits, preferences, and blockers from them
- **Conversational AI Assistant** — Create, update, delete, or list tasks using natural language chat
- **Productivity Insights** — Tracks peak hours, optimal task count, consistency streaks, and builds a personalized productivity profile
- **Full Dashboard** — Dedicated pages for Tasks, Thoughts, Reflections, Insights, and Overview
- **JWT Authentication** — Secure register and login with bcrypt password hashing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 |
| Routing | React Router DOM |
| State Management | Zustand |
| Animations | Framer Motion |
| Styling | Plain CSS |
| Backend | Node.js + Express |
| AI Engine | Google Gemini 1.5 Flash |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |

---

## Project Structure

```
CogniFlow/
├── cogniflow-backend/          # Express server
│   └── src/
│       ├── routes/             # API route definitions
│       ├── controllers/        # Business logic
│       ├── models/             # Mongoose schemas
│       ├── middleware/         # Auth middleware
│       └── services/           # Gemini AI integration
│
├── cogniflow-complete/         # React frontend
│   └── src/
│       ├── pages/              # Dashboard, Tasks, Thoughts, Insights, Reflections
│       ├── components/         # Reusable UI components
│       ├── store/              # Zustand state management
│       └── services/           # API call functions
│
└── README.md
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Gemini API Key — get one free at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repo

```bash
git clone https://github.com/prathameshdhadbale/CogniFlow.git
cd CogniFlow
```

### 2. Setup the backend

```bash
cd cogniflow-backend
npm install
```

Create a `.env` file in `cogniflow-backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup the frontend

```bash
cd cogniflow-complete
npm install
npm start
```

Frontend runs on `http://localhost:3000`

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login and receive JWT |
| GET | /api/tasks | Yes | Get all tasks |
| POST | /api/tasks | Yes | Create new task |
| PATCH | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |
| POST | /api/schedule/generate | Yes | Generate AI optimized schedule |
| POST | /api/thoughts | Yes | Submit thought for AI processing |
| GET | /api/insights | Yes | Get productivity insights |
| POST | /api/assistant | Yes | Chat with AI assistant |

---

## How the AI Works

**Schedule Generation** — When triggered, the backend sends your tasks, deadlines, and energy pattern data to Gemini 1.5 Flash with a structured prompt. Gemini returns a time-blocked schedule matched to your peak performance hours. The response is parsed and stored.

**Thought Processing** — Raw text is sent to Gemini with a prompt asking it to extract structured insights — habits, blockers, preferences, and action items. Output is saved and surfaced on the Insights page.

**AI Assistant** — A conversational interface where user messages are sent to Gemini with system context about available actions (create task, list tasks, etc.). Gemini decides the intent and the backend executes the corresponding database operation.

---

## Author

**Prathamesh Dhadbale**  
B.Tech Computer Science — IIIT Nagpur  
[GitHub](https://github.com/prathameshdhadbale)
