import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasks';
import { scheduleService } from '../services/schedule';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './SchedulePage.css';

const SchedulePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
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
      toast.success('AI schedule generated!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const getWeekDays = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

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

  const goToPreviousWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) return <Loading message="Loading schedule..." />;

  const weekDays = getWeekDays();
  const pendingCount = tasks.filter(t => !t.scheduledFor && t.status === 'pending').length;

  return (
    <div className="schedule-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Schedule Calendar</h1>
          <p className="section-subtitle">
            View your tasks organized by day
          </p>
        </div>
        {pendingCount > 0 && (
          <Button
            variant="primary"
            onClick={handleGenerateSchedule}
            disabled={generatingSchedule}
          >
            {generatingSchedule ? '🤖 Generating...' : `🤖 Schedule ${pendingCount} Pending Tasks`}
          </Button>
        )}
      </div>

      <Card>
        <div className="calendar-controls">
          <Button variant="secondary" onClick={goToPreviousWeek}>
            ← Previous Week
          </Button>
          <Button variant="primary" onClick={goToToday}>
            Today
          </Button>
          <Button variant="secondary" onClick={goToNextWeek}>
            Next Week →
          </Button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const today = isToday(day);

            return (
              <div
                key={index}
                className={`calendar-day ${today ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
              >
                <div className="day-header">
                  <div className="day-name">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="day-date">
                    {day.getDate()}
                  </div>
                  {today && <span className="today-badge">Today</span>}
                </div>

                <div className="day-tasks">
                  {dayTasks.length > 0 ? (
                    dayTasks.map(task => (
                      <CalendarTask key={task._id} task={task} />
                    ))
                  ) : (
                    <div className="no-tasks">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const CalendarTask = ({ task }) => {
  const time = task.scheduledFor
    ? new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`calendar-task ${task.status}`}>
      <div className="task-time">{time}</div>
      <div className="task-title">{task.title}</div>
      <div className="task-badges-small">
        {task.difficulty && (
          <span className={`difficulty-badge ${task.difficulty}`}>
            {task.difficulty}
          </span>
        )}
        {task.priority && (
          <span className={`priority-badge ${task.priority}`}>
            {task.priority}
          </span>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;