import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { isAuthenticated } from './utils/authApi';
import './components/Auth/Auth.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

// Placeholder Dashboard component
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDemoMode = !process.env.REACT_APP_API_URL && process.env.NODE_ENV === 'development';
  
  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      {isDemoMode && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          <strong>Demo Mode:</strong> Backend server not connected. Using demo authentication.
        </div>
      )}
      
      <h1>Welcome to Legal Eyes Dashboard</h1>
      <p>Hello, <strong>{user.username || user.name || 'User'}</strong>!</p>
      <p>You are successfully logged in with email: <strong>{user.email}</strong></p>
      
      {isDemoMode && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <h3>Demo Credentials</h3>
          <p><strong>Email:</strong> demo@legaleyes.com</p>
          <p><strong>Password:</strong> demo123</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            To connect to a real backend, set the REACT_APP_API_URL environment variable.
          </p>
        </div>
      )}
      
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#d1242f',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
