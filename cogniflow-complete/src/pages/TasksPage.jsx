import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasks';
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

  const handleComplete = async (id) => {
    try {
      await tasksService.completeTask(id, { actualDuration: 60 });
      toast.success('Task marked as complete!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to complete task');
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

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Tasks</h1>
          <p className="section-subtitle">Manage your AI-scheduled and manual tasks</p>
        </div>
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
                  { value: 'ai-scheduled', label: 'AI-Scheduled' },
                  { value: 'manual', label: 'Manual' }
                ]}
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: '', label: 'Auto' },
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
                  { value: 'light', label: 'Light' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'heavy', label: 'Heavy' }
                ]}
              />

              <Input
                label="Est. Duration (minutes)"
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
              />
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
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
                onComplete={handleComplete}
              />
            ))}
          </div>
        ) : (
          <p className="empty-message">No tasks yet. Create your first task to get started!</p>
        )}
      </Card>
    </div>
  );
};

const TaskItemFull = ({ task, onEdit, onDelete, onComplete }) => {
  const formatDateTime = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString();
  };

  return (
    <div className="task-item-full">
      <div className="task-header">
        <div>
          <div className="task-title">{task.title}</div>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
        </div>
        <div className="task-actions">
          <span className={`task-badge ${task.type === 'ai-scheduled' ? 'ai' : 'manual'}`}>
            {task.type === 'ai-scheduled' ? 'AI' : 'Manual'}
          </span>
          <span className={`status-badge ${task.status}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="task-meta">
        {task.scheduledFor && (
          <span>⏰ Scheduled: {formatDateTime(task.scheduledFor)}</span>
        )}
        {task.deadline && (
          <span>📅 Deadline: {formatDateTime(task.deadline)}</span>
        )}
        <span>📊 {task.difficulty} difficulty</span>
        <span>🎯 {task.priority || 'medium'} priority</span>
        <span>⏱️ {task.estimatedDuration}min</span>
      </div>

      {task.schedulingReason && (
        <div className="task-reason">
          💡 <strong>AI says:</strong> {task.schedulingReason}
        </div>
      )}

      <div className="task-buttons">
        {task.status !== 'completed' && (
          <>
            <button className="btn-small btn-success" onClick={() => onComplete(task._id)}>
              ✓ Complete
            </button>
            <button className="btn-small btn-primary" onClick={() => onEdit(task)}>
              ✏️ Edit
            </button>
          </>
        )}
        <button className="btn-small btn-danger" onClick={() => onDelete(task._id)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TasksPage;