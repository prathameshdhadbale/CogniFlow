import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { scheduleService } from '../services/schedule';
import { tasksService } from '../services/tasks';
import LoadStatus from '../components/Dashboard/LoadStatus';
import FocusWindow from '../components/Dashboard/FocusWindow';
import Card from '../components/common/Card';
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
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksService.completeTask(taskId, { actualDuration: 60 });
      toast.success('Task completed!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.deleteTask(taskId);
        toast.success('Task deleted');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  const scheduledTasks = todaysTasks.filter(t => t.status === 'scheduled');
  const highRiskTasks = todaysTasks.filter(t =>
    (t.deadline && new Date(t.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) ||
    t.difficulty === 'heavy'
  );

  return (
    <div className="dashboard-page">
      <h1 className="section-title">What should I focus on right now?</h1>
      <p className="section-subtitle">Your intelligent overview for today</p>

      <LoadStatus
        status={schedule?.totalLoad || 'light'}
        taskCount={scheduledTasks.length}
      />

      {schedule?.focusWindows?.[0] && scheduledTasks.length > 0 && (
        <FocusWindow
          startTime={new Date(schedule.focusWindows[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          endTime={new Date(schedule.focusWindows[0].end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          taskCount={scheduledTasks.length}
        />
      )}

      <Card title="Today's Priority Tasks">
        {scheduledTasks.length > 0 ? (
          <div className="task-list">
            {scheduledTasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <p className="empty-message">No tasks scheduled for today. Create some tasks to get started!</p>
        )}
      </Card>

      {highRiskTasks.length > 0 && (
        <Card title="⚠️ High-Risk Tasks">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Tasks that need attention due to deadline or complexity
          </p>
          <div className="task-list">
            {highRiskTasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </Card>
      )}

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/tasks')}>
          + Add Quick Task
        </Button>
        <Button variant="secondary" onClick={() => navigate('/reflections')}>
          Log Reflection
        </Button>
        <Button variant="secondary" onClick={() => navigate('/schedule')}>
          View Full Schedule
        </Button>
      </div>
    </div>
  );
};

const TaskItem = ({ task, onComplete, onDelete }) => {
  const formatTime = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <div className="task-title">{task.title}</div>
        <div className="task-actions-inline">
          <span className={`task-badge ${task.type === 'ai-scheduled' ? 'ai' : 'manual'}`}>
            {task.type === 'ai-scheduled' ? 'AI Scheduled' : 'Manual'}
          </span>
          {task.status !== 'completed' && (
            <>
              <button className="action-btn complete" onClick={() => onComplete(task._id)} title="Complete">
                ✓
              </button>
              <button className="action-btn delete" onClick={() => onDelete(task._id)} title="Delete">
                ×
              </button>
            </>
          )}
        </div>
      </div>
      <div className="task-meta">
        {task.scheduledFor && (
          <span>⏰ {formatTime(task.scheduledFor)}</span>
        )}
        <span>📊 {task.difficulty || 'Medium'} Load</span>
        <span>🎯 {task.priority || 'Medium'} Priority</span>
        {task.deadline && (
          <span>📅 Due: {new Date(task.deadline).toLocaleDateString()}</span>
        )}
        <span className={`status-badge ${task.status}`}>
          {task.status}
        </span>
      </div>
      {task.schedulingReason && (
        <p className="task-reason">💡 {task.schedulingReason}</p>
      )}
    </div>
  );
};

export default DashboardPage;