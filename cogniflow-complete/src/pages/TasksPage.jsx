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
  const [formData, setFormData] = useState({
    title: '',
    type: 'ai-scheduled',
    deadline: '',
    priority: '',
    description: ''
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
      await tasksService.createTask(formData);
      toast.success('Task created successfully!');
      setFormData({ title: '', type: 'ai-scheduled', deadline: '', priority: '', description: '' });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
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

  if (loading) return <Loading message="Loading tasks..." />;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="section-title">Tasks</h1>
          <p className="section-subtitle">Manage your AI-scheduled and manual tasks</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </Button>
      </div>

      {showForm && (
        <Card title="Create New Task">
          <form onSubmit={handleSubmit}>
            <Input
              label="Task Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              required
            />
            
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'ai-scheduled', label: 'AI-Scheduled (System decides timing)' },
                { value: 'manual', label: 'Manual (You set deadline)' }
              ]}
            />

            {formData.type === 'manual' && (
              <Input
                label="Deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            )}

            <Select
              label="Priority (Optional)"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: '', label: 'Let system decide' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
            />

            <TextArea
              label="Additional Context (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Any thoughts or context about this task..."
              rows={4}
            />

            <Button type="submit" variant="primary">Create Task</Button>
          </form>
        </Card>
      )}

      <Card title={`All Tasks (${tasks.length})`}>
        {tasks.length > 0 ? (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task._id} className="task-item">
                <div className="task-header">
                  <div className="task-title">{task.title}</div>
                  <div className="task-actions">
                    <span className={`task-badge ${task.type === 'ai-scheduled' ? 'ai' : 'manual'}`}>
                      {task.type === 'ai-scheduled' ? 'AI Scheduled' : 'Manual'}
                    </span>
                    <button className="delete-btn" onClick={() => handleDelete(task._id)}>×</button>
                  </div>
                </div>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  {task.scheduledFor && (
                    <span>⏰ {new Date(task.scheduledFor).toLocaleString()}</span>
                  )}
                  {task.deadline && (
                    <span>📅 Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  )}
                  <span>Status: {task.status || 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No tasks yet. Create your first task to get started!</p>
        )}
      </Card>
    </div>
  );
};

export default TasksPage;
