
import React , { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleService } from "../services/schedule";
import { tasksService } from "../services/tasks";
import LoadStatus from "../components/Dashboard/LoadStatus";
import FocusWindow from "../components/Dashboard/FocusWindow";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import toast from "react-hot-toast";
import "./DashboardPage.css";

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
        tasksService.getTodaysTasks(),
      ]);
      setSchedule(scheduleData);
      setTodaysTasks(tasksData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const isCompleting = currentStatus !== "completed";
      await tasksService.toggleComplete(taskId, isCompleting);
      toast.success(
        isCompleting ? "Task completed!" : "Task marked incomplete",
      );
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksService.deleteTask(taskId);
        toast.success("Task deleted");
        fetchDashboardData();
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  const activeTasks = todaysTasks.filter((t) => t.status !== "completed");
  const highRiskTasks = todaysTasks.filter(
    (t) =>
      (t.deadline &&
        new Date(t.deadline) <=
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
        t.status !== "completed") ||
      (t.difficulty === "heavy" && t.status !== "completed"),
  );

  return (
    <div className="dashboard-page">
      <h1 className="section-title">What should I focus on right now?</h1>
      <p className="section-subtitle">Your intelligent overview for today</p>

      <LoadStatus
        status={schedule?.totalLoad || "light"}
        taskCount={activeTasks.length}
      />

      {schedule?.focusWindows?.[0] && activeTasks.length > 0 && (
        <FocusWindow
          startTime={new Date(
            schedule.focusWindows[0].start,
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          endTime={new Date(schedule.focusWindows[0].end).toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" },
          )}
          taskCount={activeTasks.length}
        />
      )}

      <Card title="Today's Priority Tasks">
        {activeTasks.length > 0 ? (
          <div className="task-list">
            {activeTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="empty-message">
            <p>✨ No active tasks for today!</p>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Create some tasks or generate an AI schedule to get started.
            </p>
          </div>
        )}
      </Card>

      {highRiskTasks.length > 0 && (
        <Card title="⚠️ High-Risk Tasks">
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Tasks that need attention due to deadline or complexity
          </p>
          <div className="task-list">
            {highRiskTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </Card>
      )}

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate("/tasks")}>
          + Add Quick Task
        </Button>
        <Button variant="secondary" onClick={() => navigate("/reflections")}>
          Log Reflection
        </Button>
        <Button variant="secondary" onClick={() => navigate("/schedule")}>
          View Full Schedule
        </Button>
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggleComplete, onDelete }) => {
  const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const scheduled = task.scheduledFor
    ? formatDateTime(task.scheduledFor)
    : null;
  const deadline = task.deadline ? formatDateTime(task.deadline) : null;
  const isCompleted = task.status === "completed";

  return (
    <div className={`task-item ${isCompleted ? "completed" : ""}`}>
      <div className="task-header">
        <div className="task-checkbox-section">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={isCompleted}
            onChange={() => onToggleComplete(task._id, task.status)}
          />
          <div>
            <div className="task-title">{task.title}</div>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>
        </div>
        <div className="task-actions-inline">
          <span
            className={`task-badge ${task.type === "ai-scheduled" ? "ai" : "manual"}`}
          >
            {task.type === "ai-scheduled" ? "AI" : "Manual"}
          </span>
          <button
            className="action-btn delete"
            onClick={() => onDelete(task._id)}
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      <div className="task-meta">
        {scheduled && (
          <span className="meta-highlight">
            🗓️ {scheduled.date} at {scheduled.time}
          </span>
        )}
        {deadline && !scheduled && (
          <span className="meta-highlight">
            📅 Due: {deadline.date} at {deadline.time}
          </span>
        )}
        <span>📊 {task.difficulty || "Medium"}</span>
        <span>🎯 {task.priority || "Medium"}</span>
        <span>⏱️ {task.estimatedDuration || 60}min</span>
        <span className={`status-badge ${task.status}`}>{task.status}</span>
      </div>

      {task.schedulingReason && (
        <div className="task-reason">
          💡 <strong>AI says:</strong> {task.schedulingReason}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
