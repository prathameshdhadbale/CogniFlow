import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tasksService } from '../services/tasks';
import { scheduleService } from '../services/schedule';
import Button from '../components/common/Button';
import Input, { TextArea, Select } from '../components/common/Input';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './TasksPage.css';

const TasksPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ai-scheduled',
    deadline: '',
    priority: 'medium',
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
        toast.success('Task updated');
      } else {
        await tasksService.createTask(formData);
        toast.success('Task created');
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      type: task.type,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      priority: task.priority || 'medium',
      difficulty: task.difficulty || 'medium',
      estimatedDuration: task.estimatedDuration || 60
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
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
      toast.success(isCompleting ? 'Task completed' : 'Task reopened');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleGenerateSchedule = async () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      toast.error('No pending tasks to schedule');
      return;
    }

    setGeneratingSchedule(true);
    try {
      await scheduleService.generateSchedule();
      toast.success('AI schedule generated');
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
      priority: 'medium',
      difficulty: 'medium',
      estimatedDuration: 60
    });
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) return <Loading message="Loading tasks..." />;

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery) {
      const title = (task.title || '').toLowerCase();
      const description = (task.description || '').toLowerCase();
      return title.includes(searchQuery) || description.includes(searchQuery);
    }
    return true;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length
  };

  return (
    <div className="tasks-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            {searchQuery
              ? `Search results for "${searchParams.get('q')}"`
              : 'Manage and organize your work'}
          </p>
        </div>
        <div className="header-actions">
          {stats.pending > 0 && (
            <Button variant="secondary" onClick={handleGenerateSchedule} disabled={generatingSchedule}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10.8333 2.5L3.33333 10H10L9.16667 17.5L16.6667 10H10L10.8333 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {generatingSchedule ? 'Generating...' : `AI Schedule (${stats.pending})`}
            </Button>
          )}
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                New Task
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="view-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
            <span className="filter-count">{stats.total}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
            <span className="filter-count">{stats.pending}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
            <span className="filter-count">{stats.scheduled}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
            <span className="filter-count">{stats.inProgress}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
            <span className="filter-count">{stats.completed}</span>
          </button>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.33333 5H16.6667M3.33333 10H16.6667M3.33333 15H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            List
          </button>
          <button
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 3.33333C2.5 2.8731 2.8731 2.5 3.33333 2.5H7.5C7.96024 2.5 8.33333 2.8731 8.33333 3.33333V16.6667C8.33333 17.1269 7.96024 17.5 7.5 17.5H3.33333C2.8731 17.5 2.5 17.1269 2.5 16.6667V3.33333Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11.6667 3.33333C11.6667 2.8731 12.0398 2.5 12.5 2.5H16.6667C17.1269 2.5 17.5 2.8731 17.5 3.33333V10.8333C17.5 11.2936 17.1269 11.6667 16.6667 11.6667H12.5C12.0398 11.6667 11.6667 11.2936 11.6667 10.8333V3.33333Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Kanban
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="task-form-card animate-scale-in">
          <div className="form-card-header">
            <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="task-form">
            <Input
              label="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              required
            />

            <TextArea
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this task..."
              rows={3}
            />

            <div className="form-row">
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' }
                ]}
              />

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
            </div>

            <div className="form-row">
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                min="15"
                step="15"
              />

              <Select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'ai-scheduled', label: 'AI Scheduled' },
                  { value: 'manual', label: 'Manual' }
                ]}
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

            <div className="form-actions">
              <Button type="submit" variant="primary">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks Display */}
      {viewMode === 'list' ? (
        <div className="tasks-list-view">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M32 20V32L40 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="empty-title">No {filter !== 'all' && filter} tasks</h3>
              <p className="empty-description">
                {filter === 'all'
                  ? 'Create your first task to get started'
                  : `You don't have any ${filter} tasks at the moment`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <KanbanView
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
};

const TaskItem = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const formatDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-item-left">
        <label className="task-checkbox-wrapper">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onToggleComplete(task._id, task.status)}
            className="task-checkbox"
          />
          <span className="checkbox-custom"></span>
        </label>

        <div className="task-item-content">
          <div className="task-item-header">
            <h4 className="task-item-title">{task.title}</h4>
            <div className="task-badges">
              <span
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
              <span className="difficulty-badge">{task.difficulty}</span>
              <span className="status-badge">{task.status}</span>
            </div>
          </div>

          {task.description && (
            <p className="task-item-description">{task.description}</p>
          )}

          <div className="task-item-meta">
            {task.scheduledFor && (
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4V8L10.6667 9.33333M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Scheduled: {formatDateTime(task.scheduledFor)}
              </span>
            )}
            {task.deadline && !task.scheduledFor && (
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 2H12.6667V0.666667H11.3333V2H4.66667V0.666667H3.33333V2H2.66667C1.93333 2 1.33333 2.6 1.33333 3.33333V14C1.33333 14.7333 1.93333 15.3333 2.66667 15.3333H13.3333C14.0667 15.3333 14.6667 14.7333 14.6667 14V3.33333C14.6667 2.6 14.0667 2 13.3333 2ZM13.3333 14H2.66667V5.33333H13.3333V14Z" fill="currentColor"/>
                </svg>
                Due: {formatDateTime(task.deadline)}
              </span>
            )}
            <span className="meta-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 4V8L10.6667 9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {task.estimatedDuration || 60} min
            </span>
          </div>
        </div>
      </div>

      <div className="task-item-actions">
        <button className="action-btn" onClick={() => onEdit(task)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6667 1.44775C12.9146 1.44775 13.1598 1.49653 13.3886 1.59129C13.6174 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38268 14.4088 2.61147C14.5036 2.84026 14.5523 3.08543 14.5523 3.33337C14.5523 3.58132 14.5036 3.82649 14.4088 4.05528C14.314 4.28407 14.1751 4.49162 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit
        </button>
        <button className="action-btn delete" onClick={() => onDelete(task._id)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.33334 4.00004V2.66671C5.33334 2.31309 5.47381 1.97395 5.72386 1.7239C5.97391 1.47385 6.31305 1.33337 6.66667 1.33337H9.33334C9.68696 1.33337 10.0261 1.47385 10.2761 1.7239C10.5262 1.97395 10.6667 2.31309 10.6667 2.66671V4.00004M12.6667 4.00004V13.3334C12.6667 13.687 12.5262 14.0261 12.2761 14.2762C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2762C3.47381 14.0261 3.33334 13.687 3.33334 13.3334V4.00004H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

const KanbanView = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  const columns = {
    pending: { title: 'Pending', tasks: tasks.filter(t => t.status === 'pending') },
    scheduled: { title: 'Scheduled', tasks: tasks.filter(t => t.status === 'scheduled') },
    'in-progress': { title: 'In Progress', tasks: tasks.filter(t => t.status === 'in-progress') },
    completed: { title: 'Completed', tasks: tasks.filter(t => t.status === 'completed') }
  };

  return (
    <div className="kanban-board">
      {Object.entries(columns).map(([status, column]) => (
        <div key={status} className="kanban-column">
          <div className="kanban-header">
            <h3>{column.title}</h3>
            <span className="kanban-count">{column.tasks.length}</span>
          </div>
          <div className="kanban-tasks">
            {column.tasks.map(task => (
              <KanbanCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const KanbanCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'var(--error)',
      medium: 'var(--warning)',
      low: 'var(--success)'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="kanban-card">
      <div className="kanban-card-header">
        <label className="task-checkbox-wrapper">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onToggleComplete(task._id, task.status)}
            className="task-checkbox"
          />
          <span className="checkbox-custom"></span>
        </label>
        <span
          className="kanban-priority-dot"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
      </div>
      <h4 className="kanban-card-title">{task.title}</h4>
      {task.description && (
        <p className="kanban-card-description">{task.description}</p>
      )}
      <div className="kanban-card-footer">
        <div className="kanban-meta">
          <span className="kanban-badge">{task.priority}</span>
          <span className="kanban-badge">{task.estimatedDuration || 60}m</span>
        </div>
        <div className="kanban-actions">
          <button className="kanban-action-btn" onClick={() => onEdit(task)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6667 1.44775C12.9146 1.44775 13.1598 1.49653 13.3886 1.59129C13.6174 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.38268 14.4088 2.61147C14.5036 2.84026 14.5523 3.08543 14.5523 3.33337C14.5523 3.58132 14.5036 3.82649 14.4088 4.05528C14.314 4.28407 14.1751 4.49162 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="kanban-action-btn delete" onClick={() => onDelete(task._id)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H3.33333H14M5.33334 4.00004V2.66671C5.33334 2.31309 5.47381 1.97395 5.72386 1.7239C5.97391 1.47385 6.31305 1.33337 6.66667 1.33337H9.33334C9.68696 1.33337 10.0261 1.47385 10.2761 1.7239C10.5262 1.97395 10.6667 2.31309 10.6667 2.66671V4.00004M12.6667 4.00004V13.3334C12.6667 13.687 12.5262 14.0261 12.2761 14.2762C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2762C3.47381 14.0261 3.33334 13.687 3.33334 13.3334V4.00004H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;