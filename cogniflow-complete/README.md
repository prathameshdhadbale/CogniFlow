# CogniFlow - React Frontend

An intelligent personal scheduling system that learns from your behavior and optimizes your productivity.

## 🚀 Features

- **AI-Powered Scheduling**: Integrates with Claude API to generate intelligent schedules
- **Pattern Recognition**: Learns your peak performance times and load tolerance
- **Thought Processing**: Captures unstructured thoughts and uses them to improve scheduling
- **Daily Reflections**: Structured feedback system for continuous learning
- **Insights Dashboard**: Visualize your productivity patterns
- **Chat Assistant**: Ask questions and get explanations about your schedule

## 📦 Tech Stack

- **React 18** - UI framework
- **React Router v6** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **date-fns** - Date utilities

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd cogniflow-react
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your backend API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Card, Button, Input, etc.)
│   ├── Dashboard/       # Dashboard-specific components
│   ├── Tasks/           # Task management components
│   ├── Thoughts/        # Thought capture components
│   ├── Reflections/     # Reflection components
│   ├── Insights/        # Insights visualization
│   └── Chat/            # Chat assistant components
├── pages/               # Page components
├── services/            # API service layer
├── store/               # Zustand state management
├── styles/              # Global styles
└── utils/               # Utility functions
```

## 🔌 API Integration

All API calls are configured in the `services/` directory. The frontend expects the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/complete` - Mark task complete

### Thoughts
- `GET /api/thoughts` - Get all thoughts
- `POST /api/thoughts` - Create thought (triggers AI processing)

### Reflections
- `GET /api/reflections` - Get all reflections
- `POST /api/reflections` - Create reflection

### Schedule
- `GET /api/schedule/today` - Get today's schedule
- `POST /api/schedule/generate` - Generate AI schedule

### Insights
- `GET /api/insights` - Get user insights
- `GET /api/insights/patterns` - Get behavior patterns

### Chat
- `POST /api/chat/message` - Send message to AI assistant
- `GET /api/chat/history` - Get chat history

## 🎨 Customization

### Theming

Edit `src/styles/global.css` to customize colors and styles:

```css
:root {
  --primary: #1a1a2e;
  --accent: #0f4c75;
  --accent-light: #3282b8;
  /* ... more variables */
}
```

### Fonts

The project uses:
- **Newsreader** - Display font (headers, titles)
- **DM Sans** - Body font (text, UI elements)

Change fonts in `public/index.html` and `src/styles/global.css`

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 🔐 Environment Variables

Create a `.env` file with:

```
REACT_APP_API_URL=http://localhost:5000/api
```

For production, update this to your production API URL.

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (< 768px)

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `REACT_APP_API_URL`
4. Deploy!

### Netlify

1. Build: `npm run build`
2. Publish directory: `build`
3. Add environment variable in Netlify dashboard

## 🤝 Backend Integration

This frontend is designed to work with the CogniFlow Node.js backend. Make sure:

1. Backend is running on the URL specified in `REACT_APP_API_URL`
2. CORS is configured to allow requests from your frontend domain
3. All required API endpoints are implemented

## 📝 Key Features Implementation

### State Management (Zustand)

Global state is managed in `src/store/index.js`:
- User authentication
- Tasks list
- Schedule data
- Insights
- Loading states

### API Service Layer

All backend communication is centralized in `src/services/`:
- Automatic JWT token injection
- Error handling
- Request/response interceptors

### Protected Routes

Authentication check in `App.jsx`:
```javascript
if (!isAuthenticated) {
  return <LoginPage />;
}
```

## 🎯 Next Steps

1. **Connect to Backend**: Implement all API endpoints
2. **Add Real Data**: Replace mock data with API calls
3. **Test Authentication**: Ensure JWT flow works
4. **Deploy**: Deploy to Vercel/Netlify

## 📄 License

MIT

## 👨‍💻 Author

Your Name - Your Website/GitHub

---

Built with ❤️ using React and Claude AI
