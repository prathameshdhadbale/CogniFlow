require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectMongoDB, connectPostgres } = require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const taskRoutes = require('./src/routes/tasks');
const thoughtRoutes = require('./src/routes/thoughts');
const reflectionRoutes = require('./src/routes/reflections');
const scheduleRoutes = require('./src/routes/schedule');
const insightRoutes = require('./src/routes/insights');
const chatRoutes = require('./src/routes/chat');

const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/thoughts', thoughtRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'CogniFlow API is running',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            thoughts: '/api/thoughts',
            reflections: '/api/reflections',
            schedule: '/api/schedule',
            insights: '/api/insights',
            chat: '/api/chat'
        }
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectMongoDB();
        // await connectPostgres();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`API Endpoints ready`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    console.error(err);
    process.exit(1);
});