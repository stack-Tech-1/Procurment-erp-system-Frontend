// frontend/src/services/api.js - ENHANCED VERSION
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add retry configuration
    config.retry = config.retry || 3;
    config.retryDelay = config.retryDelay || 1000;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // If we haven't exceeded retry count and it's a server error
    if (config && config.retry > 0 && 
        (error.response?.status >= 500 || error.code === 'NETWORK_ERROR')) {
      
      config.retry -= 1;
      
      // Wait for the retry delay
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelay || 1000)
      );
      
      // Retry the request
      return api(config);
    }
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 502 || error.response?.status === 503) {
      console.error('Backend service unavailable');
      // You could show a user-friendly message here
    }
    
    return Promise.reject(error);
  }
);

// Convenience methods with enhanced error handling
export const apiClient = {
  async request(config) {
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw this.formatError(error);
    }
  },

  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  },

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  },

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  },

  patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
  },

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  },

  formatError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: null,
        data: null
      };
    }
  }
};

export default api;