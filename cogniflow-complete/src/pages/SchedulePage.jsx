import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasks';
import { scheduleService } from '../services/schedule';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './SchedulePage.css';

const SchedulePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await tasksService.getTasks();
      setTasks(data.filter(t => t.scheduledFor || t.deadline));
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setGeneratingSchedule(true);
    try {
      await scheduleService.generateSchedule();
      toast.success('Schedule generated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const isCompleting = currentStatus !== 'completed';
      await tasksService.toggleComplete(taskId, isCompleting);
      toast.success(isCompleting ? 'Task completed' : 'Task reopened');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) return <Loading message="Loading schedule..." />;

  const pendingCount = tasks.filter(t => !t.scheduledFor && t.status === 'pending').length;

  return (
    <div className="schedule-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">Your calendar view</p>
        </div>
        {pendingCount > 0 && (
          <Button variant="primary" onClick={handleGenerateSchedule} disabled={generatingSchedule}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10.8333 2.5L3.33333 10H10L9.16667 17.5L16.6667 10H10L10.8333 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {generatingSchedule ? 'Generating...' : `AI Schedule (${pendingCount})`}
          </Button>
        )}
      </div>

      <div className="schedule-controls">
        <div className="view-mode-buttons">
          <button
            className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6.66667 1.66666V4.16666M13.3333 1.66666V4.16666M2.5 6.66666H17.5M4.16667 3.33333H15.8333C16.7538 3.33333 17.5 4.07952 17.5 4.99999V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V4.99999C2.5 4.07952 3.24619 3.33333 4.16667 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Day
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6.66667 1.66666V4.16666M13.3333 1.66666V4.16666M2.5 6.66666H17.5M2.5 8.33333H17.5M2.5 11.6667H17.5M4.16667 3.33333H15.8333C16.7538 3.33333 17.5 4.07952 17.5 4.99999V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V4.99999C2.5 4.07952 3.24619 3.33333 4.16667 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Week
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6.66667 1.66666V4.16666M13.3333 1.66666V4.16666M2.5 6.66666H17.5M4.16667 3.33333H15.8333C16.7538 3.33333 17.5 4.07952 17.5 4.99999V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333H4.16667C3.24619 18.3333 2.5 17.5871 2.5 16.6667V4.99999C2.5 4.07952 3.24619 3.33333 4.16667 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Month
          </button>
        </div>

        <div className="date-navigation">
          <Button variant="ghost" size="sm" onClick={goToPrevious}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={goToNext}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
      </div>

      <div className="current-date-display">
        {viewMode === 'day' && currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}
        {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}`}
        {viewMode === 'month' && currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}
      </div>

      <div className="schedule-content">
        {viewMode === 'week' && (
          <WeekView
            startDate={currentDate}
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            date={currentDate}
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            date={currentDate}
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </div>
    </div>
  );
};

const WeekView = ({ startDate, tasks, onToggleComplete }) => {
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }

  const getTasksForDay = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      const taskDate = task.scheduledFor ? new Date(task.scheduledFor) : new Date(task.deadline);
      return taskDate >= dayStart && taskDate <= dayEnd;
    }).sort((a, b) => {
      const aDate = new Date(a.scheduledFor || a.deadline);
      const bDate = new Date(b.scheduledFor || b.deadline);
      return aDate - bDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="week-view">
      {days.map((day, index) => {
        const dayTasks = getTasksForDay(day);
        const today = isToday(day);

        return (
          <div key={index} className={`week-day ${today ? 'today' : ''}`}>
            <div className="week-day-header">
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-number">{day.getDate()}</div>
            </div>

            <div className="week-day-tasks">
              {dayTasks.length > 0 ? (
                dayTasks.map(task => (
                  <ScheduleTask key={task._id} task={task} onToggleComplete={onToggleComplete} />
                ))
              ) : (
                <div className="no-tasks-placeholder">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DayView = ({ date, tasks, onToggleComplete }) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayTasks = tasks.filter(task => {
    const taskDate = task.scheduledFor ? new Date(task.scheduledFor) : new Date(task.deadline);
    return taskDate >= dayStart && taskDate <= dayEnd;
  }).sort((a, b) => {
    const aDate = new Date(a.scheduledFor || a.deadline);
    const bDate = new Date(b.scheduledFor || b.deadline);
    return aDate - bDate;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="day-view">
      {hours.map(hour => {
        const hourStart = new Date(date);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(date);
        hourEnd.setHours(hour + 1, 0, 0, 0);

        const hourTasks = dayTasks.filter(task => {
          const taskTime = new Date(task.scheduledFor || task.deadline);
          return taskTime >= hourStart && taskTime < hourEnd;
        });

        return (
          <div key={hour} className="hour-slot">
            <div className="hour-label">
              {hour === 0 ? '12 AM' :
               hour < 12 ? `${hour} AM` :
               hour === 12 ? '12 PM' :
               `${hour - 12} PM`}
            </div>
            <div className="hour-content">
              {hourTasks.map(task => (
                <ScheduleTask
                  key={task._id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  showTime
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MonthView = ({ date, tasks, onToggleComplete }) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  const currentDate = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const getTasksForDay = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      const taskDate = task.scheduledFor ? new Date(task.scheduledFor) : new Date(task.deadline);
      return taskDate >= dayStart && taskDate <= dayEnd;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === month;
  };

  return (
    <div className="month-view">
      <div className="month-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="month-header-day">{day}</div>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const today = isToday(day);
          const currentMonth = isCurrentMonth(day);

          return (
            <div
              key={index}
              className={`month-day ${today ? 'today' : ''} ${!currentMonth ? 'other-month' : ''}`}
            >
              <div className="month-day-number">{day.getDate()}</div>
              <div className="month-day-tasks">
                {dayTasks.slice(0, 2).map(task => (
                  <div key={task._id} className="month-task-dot" title={task.title}>
                    <span
                      className="task-dot"
                      style={{
                        backgroundColor: task.priority === 'high' ? 'var(--error)' :
                                        task.priority === 'low' ? 'var(--success)' : 'var(--warning)'
                      }}
                    />
                    <span className="task-title-month">{task.title}</span>
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="more-tasks-count">+{dayTasks.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ScheduleTask = ({ task, onToggleComplete, showTime }) => {
  const formatTime = (date) => {
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
    <div className={`schedule-task ${task.status === 'completed' ? 'completed' : ''}`}>
      <div
        className="task-priority-bar"
        style={{ backgroundColor: getPriorityColor(task.priority) }}
      />
      <div className="schedule-task-content">
        <div className="schedule-task-header">
          <label className="task-checkbox-wrapper">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => onToggleComplete(task._id, task.status)}
              className="task-checkbox"
            />
            <span className="checkbox-custom"></span>
          </label>
          <div className="schedule-task-info">
            {showTime && task.scheduledFor && (
              <div className="schedule-task-time">{formatTime(task.scheduledFor)}</div>
            )}
            <div className="schedule-task-title">{task.title}</div>
            <div className="schedule-task-meta">
              <span>{task.difficulty || 'medium'}</span>
              <span>•</span>
              <span>{task.estimatedDuration || 60}min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;