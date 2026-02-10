import api from './api';

export const insightsService = {
  async getInsights() {
    const response = await api.get('/insights');
    return response.data;
  },

  async getPatterns() {
    const response = await api.get('/insights/patterns');
    return response.data;
  }
};
