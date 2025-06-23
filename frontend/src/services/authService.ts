import axios from 'axios';

// Determine API URL based on environment
const getApiBaseUrl = () => {
  // If we're on the production domain, use the production API
  if (window.location.hostname === 'app.moneyclip.money') {
    const url = 'https://clip-mvp-production.up.railway.app';
    console.log('Using production API URL:', url);
    return url;
  }
  
  // Use environment variable or fall back to localhost
  const url = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  console.log('Using development API URL:', url);
  return url;
};

const API_BASE_URL = getApiBaseUrl();

console.log('Money Clip API URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
  withCredentials: false,
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