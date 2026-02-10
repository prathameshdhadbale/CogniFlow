import api from './api';

export const thoughtsService = {
  async getThoughts() {
    const response = await api.get('/thoughts');
    return response.data;
  },

  async createThought(content) {
    const response = await api.post('/thoughts', { content });
    return response.data;
  },

  async getThought(id) {
    const response = await api.get(`/thoughts/${id}`);
    return response.data;
  }
};
