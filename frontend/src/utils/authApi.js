// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to handle API requests
const apiRequest = async (url, options = {}, requiresAuth = true) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Only add Authorization header for protected endpoints
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        // DRF returns errors in different shapes depending on the endpoint
        errorMessage =
          errorData.detail ||
          errorData.message ||
          (errorData.username && `Username: ${errorData.username[0]}`) ||
          (errorData.email && `Email: ${errorData.email[0]}`) ||
          (errorData.password && `Password: ${errorData.password[0]}`) ||
          `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:8000');
    }
    throw error;
  }
};

// ── Public endpoints (no auth header sent) ──────────────────────────────────

export const loginUser = async (credentials) => {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  }, false);
};

export const registerUser = async (userData) => {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      username: userData.username,
      password: userData.password,
    }),
  }, false); // <-- no auth header
};

// ── Protected endpoints ──────────────────────────────────────────────────────

export const logoutUser = async () => {
  return apiRequest('/auth/logout/', { method: 'POST' });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me/');
};

export const getDocuments = async () => {
  return apiRequest('/docs/');
};

export const deleteDocument = async (id) => {
  return apiRequest(`/docs/${id}/`, { method: 'DELETE' });
};

export const refreshToken = async () => {
  const token = localStorage.getItem('refreshToken');
  return apiRequest('/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: token }),
  }, false);
};

export const forgotPassword = async (email) => {
  return apiRequest('/auth/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, false);
};

export const resetPassword = async (token, newPassword) => {
  return apiRequest('/auth/reset-password/', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword }),
  }, false);
};

// ── Utility ──────────────────────────────────────────────────────────────────

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
