import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleService } from '../services/schedule';
import { tasksService } from '../services/tasks';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [scheduleData, tasksData] = await Promise.all([
        scheduleService.getTodaySchedule(),
        tasksService.getTodaysTasks()
      ]);
      setSchedule(scheduleData);
      setTodaysTasks(tasksData);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const isCompleting = currentStatus !== 'completed';
      await tasksService.toggleComplete(taskId, isCompleting);
      toast.success(isCompleting ? 'Task completed' : 'Task reopened');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  const activeTasks = todaysTasks.filter(t => t.status !== 'completed');
  const completedTasks = todaysTasks.filter(t => t.status === 'completed');
  const completionRate = todaysTasks.length > 0
    ? Math.round((completedTasks.length / todaysTasks.length) * 100)
    : 0;

  return (
    <div className="dashboard animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getTimeOfDay()}</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/tasks')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 11L12 14L22 4M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-label">Today's Tasks</div>
            <div className="stat-value">{activeTasks.length}</div>
            <div className="stat-trend positive">
              {completedTasks.length} completed
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-trend positive">
              {completionRate > 75 ? 'Excellent' : completionRate > 50 ? 'Good' : 'Keep going'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-label">Productivity</div>
            <div className="stat-value">{schedule?.totalLoad || 'Optimal'}</div>
            <div className="stat-trend neutral">Current load</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-label">Peak Hours</div>
            <div className="stat-value">2-4 PM</div>
            <div className="stat-trend neutral">Best focus time</div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Today's Schedule</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/schedule')}>
            View all
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>

        {activeTasks.length > 0 ? (
          <div className="tasks-list">
            {activeTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 24L22 30L34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="empty-title">All caught up!</h3>
            <p className="empty-description">You have no tasks scheduled for today</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/thoughts')}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 9H16M8 13H14M6 20L3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H9L6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="action-label">Capture Thought</div>
            <div className="action-description">Quick note or insight</div>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/reflections')}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="action-label">Daily Reflection</div>
            <div className="action-description">Review your day</div>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/chat')}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="action-label">Ask AI</div>
            <div className="action-description">Get productivity help</div>
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onToggleComplete }) => {
  const formatTime = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'var(--error)',
      medium: 'var(--warning)',
      low: 'var(--success)'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-main">
        <label className="task-checkbox-wrapper">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onToggleComplete(task._id, task.status)}
            className="task-checkbox"
          />
          <span className="checkbox-custom"></span>
        </label>
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}
        </div>
      </div>
      <div className="task-meta">
        {task.scheduledFor && (
          <span className="task-time">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4V8L10.6667 9.33333M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {formatTime(task.scheduledFor)}
          </span>
        )}
        <span
          className="task-priority-dot"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
        <span className="task-duration">{task.estimatedDuration || 60}m</span>
      </div>
    </div>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export default DashboardPage;