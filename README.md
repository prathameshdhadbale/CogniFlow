# CogniFlow - AI-Powered Scheduling System

CogniFlow is an intelligent productivity system designed to optimize your daily schedule using the power of **Gemini AI**. It goes beyond a simple to-do list by analyzing your work patterns, energy levels, and task complexity to create an optimal workflow.

## 🚀 Key Features

* **AI-Powered Scheduling**: Automatically generates an optimal schedule by matching difficult tasks with your peak performance hours.
* **Thought Processing**: Analyzes your raw thoughts to extract actionable insights about your habits, preferences, and blockers.
* **Conversational AI Assistant**: A built-in chat interface that allows you to create, update, delete, or list tasks using natural language.
* **Productivity Insights**: Tracks patterns like peak hours, optimal daily task counts, and consistency streaks to provide personalized productivity profiles.
* **Full-Stack Management**: Includes dedicated pages for Tasks, Thoughts, Reflections, Insights, and a comprehensive Dashboard.

## 🛠️ Tech Stack

### Backend

* **Runtime**: Node.js with Express
* **AI Engine**: Google Generative AI (Gemini 1.5 Flash)
* **Database**: MongoDB (via Mongoose) and PostgreSQL support
* **Authentication**: JSON Web Tokens (JWT) and Bcrypt for secure password hashing

### Frontend

* **Framework**: React (v18.2.0)
* **Routing**: React Router DOM
* **State Management**: Zustand
* **Animations**: Framer Motion
* **Styling**: Custom CSS with a focus on a clean, modern UI

## 📂 Project Structure

* `/cogniflow-backend`: Express server handling AI integration, database connections, and business logic.
* `/cogniflow-complete`: React frontend containing the user interface and service layers for API communication.

## 🚦 Getting Started

### Prerequisites

* Node.js & npm
* MongoDB instance
* Gemini API Key (Google AI Studio)

### Installation

1. **Clone the repository**
2. **Setup Backend**:
```bash
cd cogniflow-backend
npm install
# Create a .env file with:
# PORT=5000
# MONGODB_URI=your_mongodb_uri
# GEMINI_API_KEY=your_api_key
# FRONTEND_URL=http://localhost:3000
npm run dev

```


3. **Setup Frontend**:
```bash
cd cogniflow-complete
npm install
npm start

```



## 📄 License

This project is licensed under the **MIT License**.
