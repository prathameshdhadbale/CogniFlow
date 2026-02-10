import React, { useEffect, useState } from 'react';
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

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <h1 className="section-title">What should I focus on right now?</h1>
      <p className="section-subtitle">Your intelligent overview for today</p>

      <LoadStatus 
        status={schedule?.totalLoad || 'optimal'}
        taskCount={todaysTasks.length}
      />

      {schedule?.focusWindows?.[0] && (
        <FocusWindow
          startTime={new Date(schedule.focusWindows[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          endTime={new Date(schedule.focusWindows[0].end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          taskCount={2}
        />
      )}

      <Card title="Today's Priority Tasks">
        {todaysTasks.length > 0 ? (
          <div className="task-list">
            {todaysTasks.map(task => (
              <TaskItem key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <p className="empty-message">No tasks scheduled for today. You're all clear!</p>
        )}
      </Card>

      <div className="quick-actions">
        <Button variant="primary">+ Add Quick Task</Button>
        <Button variant="secondary">Log Reflection</Button>
        <Button variant="secondary">View Full Schedule</Button>
      </div>
    </div>
  );
};

const TaskItem = ({ task }) => (
  <div className="task-item">
    <div className="task-header">
      <div className="task-title">{task.title}</div>
      <span className={`task-badge ${task.type === 'ai-scheduled' ? 'ai' : 'manual'}`}>
        {task.type === 'ai-scheduled' ? 'AI Scheduled' : 'Manual'}
      </span>
    </div>
    <div className="task-meta">
      {task.scheduledFor && (
        <span>⏰ {new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      )}
      <span>📊 {task.difficulty || 'Medium'} Load</span>
      <span>🎯 {task.priority || 'Medium'} Priority</span>
    </div>
  </div>
);

export default DashboardPage;
