import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasks';
import { scheduleService } from '../services/schedule';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input, { TextArea, Select } from '../components/common/Input';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ai-scheduled',
    deadline: '',
    priority: '',
    difficulty: 'medium',
    estimatedDuration: 60
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await tasksService.getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksService.updateTask(editingTask._id, formData);
        toast.success('Task updated successfully!');
      } else {
        await tasksService.createTask(formData);
        toast.success('Task created successfully!');
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      type: task.type,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      priority: task.priority || '',
      difficulty: task.difficulty || 'medium',
      estimatedDuration: task.estimatedDuration || 60
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.deleteTask(id);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const isCompleting = currentStatus !== 'completed';
      await tasksService.toggleComplete(id, isCompleting);
      toast.success(isCompleting ? 'Task completed!' : 'Task marked incomplete');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleGenerateSchedule = async () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      toast.error('No pending tasks to schedule. Create some tasks first!');
      return;
    }

    setGeneratingSchedule(true);
    try {
      const result = await scheduleService.generateSchedule();
      toast.success('AI schedule generated! Check your tasks.');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'ai-scheduled',
      deadline: '',
      priority: '',
      difficulty: 'medium',
      estimatedDuration: 60
    });
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) return <Loading message="Loading tasks..." />;

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const scheduledCount = tasks.filter(t => t.status === 'scheduled').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Tasks</h1>
          <p className="section-subtitle">
            {tasks.length} total • {pendingCount} pending • {scheduledCount} scheduled • {completedCount} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {pendingCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleGenerateSchedule}
              disabled={generatingSchedule}
            >
              {generatingSchedule ? '🤖 Generating...' : '🤖 AI Schedule'}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : '+ New Task'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card title={editingTask ? 'Edit Task' : 'Create New Task'}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Task Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              required
            />

            <TextArea
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'ai-scheduled', label: 'AI-Scheduled (Let AI decide when)' },
                  { value: 'manual', label: 'Manual (I set deadline)' }
                ]}
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: '', label: 'Let AI Decide' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="Difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                options={[
                  { value: 'light', label: 'Light (Easy task)' },
                  { value: 'medium', label: 'Medium (Normal task)' },
                  { value: 'heavy', label: 'Heavy (Hard task)' }
                ]}
              />

              <Input
                label="Estimated Duration (minutes)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                min="15"
                step="15"
              />
            </div>

            {formData.type === 'manual' && (
              <Input
                label="Deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="submit" variant="primary">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
              {editingTask && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card title={`All Tasks (${tasks.length})`}>
        {tasks.length > 0 ? (
          <div className="task-list">
            {tasks.map(task => (
              <TaskItemFull
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-message">
            <p>📝 No tasks yet!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Create your first task to get started with CogniFlow.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

const TaskItemFull = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return {
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const scheduled = task.scheduledFor ? formatDateTime(task.scheduledFor) : null;
  const deadline = task.deadline ? formatDateTime(task.deadline) : null;
  const completed = task.completedAt ? formatDateTime(task.completedAt) : null;
  const isCompleted = task.status === 'completed';

  return (
    <div className={`task-item-full ${isCompleted ? 'completed' : ''}`}>
      <div className="task-header-full">
        <div className="task-checkbox-section">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={isCompleted}
            onChange={() => onToggleComplete(task._id, task.status)}
            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          />
          <div className="task-content">
            <div className="task-title-full">{task.title}</div>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>
        </div>
        <div className="task-badges">
          <span className={`task-badge ${task.type === 'ai-scheduled' ? 'ai' : 'manual'}`}>
            {task.type === 'ai-scheduled' ? 'AI' : 'Manual'}
          </span>
          <span className={`status-badge ${task.status}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="task-details">
        {scheduled && (
          <div className="task-time-info scheduled">
            <strong>🗓️ Scheduled:</strong> {scheduled.date} at {scheduled.time}
          </div>
        )}
        {deadline && (
          <div className="task-time-info deadline">
            <strong>📅 Deadline:</strong> {deadline.date} at {deadline.time}
          </div>
        )}
        {completed && (
          <div className="task-time-info completed-time">
            <strong>✅ Completed:</strong> {completed.date} at {completed.time}
          </div>
        )}
      </div>

      <div className="task-meta-full">
        <span>📊 {task.difficulty} difficulty</span>
        <span>🎯 {task.priority || 'medium'} priority</span>
        <span>⏱️ {task.estimatedDuration || 60}min estimated</span>
        {task.actualDuration && (
          <span>✓ {task.actualDuration}min actual</span>
        )}
      </div>

      {task.schedulingReason && (
        <div className="task-reason">
          💡 <strong>AI Insight:</strong> {task.schedulingReason}
        </div>
      )}

      <div className="task-buttons">
        <button className="btn-small btn-primary" onClick={() => onEdit(task)}>
          ✏️ Edit
        </button>
        <button className="btn-small btn-danger" onClick={() => onDelete(task._id)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TasksPage;