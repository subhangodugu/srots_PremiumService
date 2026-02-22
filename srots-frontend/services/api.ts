import axios from 'axios';

/**
 * API Gateway for Srots Platform
 * Configured exclusively for Local Java Backend integration (Spring Boot).
 */

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * AUTHENTICATION INTERCEPTOR
 * Injects JWT Bearer token into every outgoing request
 */
api.interceptors.request.use(
  (config) => {
    // STANDARD KEY: 'token' (Synced with authService.ts and App.tsx)
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR - Handle authentication failures
 * - 401 → clear all auth data → redirect to login
 * - Do NOT redirect on login endpoint itself
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Only handle 401 for non-auth requests
    if (status === 401 && !url?.includes('/auth/login') && !url?.includes('/auth/refresh')) {
      console.warn('Unauthorized (401) - Clearing session and redirecting to login');

      // Clear standardized auth keys
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('premiumActive');

      // Force clean login state
      window.location.hash = '';           // remove any hash/route
      window.location.pathname = '/';      // go to root (login)
      window.location.reload();            // force full reload to clear React state
    }

    return Promise.reject(error);
  }
);

export default api;