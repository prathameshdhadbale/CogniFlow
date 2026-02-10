import api from './api';

export const reflectionsService = {
  async getReflections() {
    const response = await api.get('/reflections');
    return response.data;
  },

  async createReflection(reflectionData) {
    const response = await api.post('/reflections', reflectionData);
    return response.data;
  },

  async getTodayReflection() {
    const response = await api.get('/reflections/today');
    return response.data;
  }
};
