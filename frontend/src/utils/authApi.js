// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to handle API requests
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // Check if the response is ok
    if (!response.ok) {
      // Try to parse JSON error message
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Handle network errors (like ECONNREFUSED)
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:5000');
    }
    
    throw error;
  }
};

// Authentication API functions
export const loginUser = async (credentials) => {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerUser = async (userData) => {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      username: userData.username,
      password: userData.password,
    }),
  });
};

export const logoutUser = async () => {
  return apiRequest('/auth/logout/', {
    method: 'POST',
  });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me/');
};

export const refreshToken = async () => {
  return apiRequest('/auth/refresh/', {
    method: 'POST',
  });
};

export const forgotPassword = async (email) => {
  return apiRequest('/auth/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (token, newPassword) => {
  return apiRequest('/auth/reset-password/', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword }),
  });
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Basic token validation (you might want to add more sophisticated validation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

// Utility function to clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
