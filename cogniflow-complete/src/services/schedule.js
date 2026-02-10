import api from './api';

export const scheduleService = {
  async getTodaySchedule() {
    const response = await api.get('/schedule/today');
    return response.data;
  },

  async getSchedule(date) {
    const response = await api.get(`/schedule/${date}`);
    return response.data;
  },

  async generateSchedule() {
    const response = await api.post('/schedule/generate');
    return response.data;
  },

  async adjustSchedule(adjustments) {
    const response = await api.put('/schedule/adjust', adjustments);
    return response.data;
  }
};
