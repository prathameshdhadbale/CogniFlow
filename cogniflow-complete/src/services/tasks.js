import api from './api';

export const tasksService = {
  async getTasks() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async completeTask(id, data) {
    const response = await api.put(`/tasks/${id}/complete`, data);
    return response.data;
  },

  async getTodaysTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await api.get('/tasks');
    const allTasks = response.data;

    // Filter tasks scheduled for today or with today's deadline
    return allTasks.filter(task => {
      if (task.scheduledFor) {
        const scheduledDate = new Date(task.scheduledFor);
        return scheduledDate >= today && scheduledDate < tomorrow;
      }
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        return deadlineDate >= today && deadlineDate < tomorrow;
      }
      return task.status === 'pending' || task.status === 'in-progress';
    });
  }
};