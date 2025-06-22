import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  // Set auth token for future requests
  setAuthToken: (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response;
  },

  // Signup user
  signup: async (email: string, password: string, firstName?: string) => {
    const response = await apiClient.post('/api/auth/signup', {
      email,
      password,
      first_name: firstName,
    });
    return response;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response;
  },
};

export default apiClient;