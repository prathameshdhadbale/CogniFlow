import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    // const response = await api.post('/auth/login', credentials);
    // if (response.data.token) {
    //   localStorage.setItem('token', response.data.token);
    //   localStorage.setItem('user', JSON.stringify(response.data.user));
    // }
    // return response.data;
    const mockResponse = {
      data: {
        token: 'mock-jwt-token-12345',
        user: {
          _id: '1',
          name: 'Test User',
          email: credentials.email
        }
      }
    };
    
    localStorage.setItem('token', mockResponse.data.token);
    localStorage.setItem('user', JSON.stringify(mockResponse.data.user));
    return mockResponse.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
