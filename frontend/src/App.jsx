import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IndexPage from './pages/index';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
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

// Profile/Dashboard component
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', backgroundColor: '#1E1E1E', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <h1 style={{ fontFamily: 'Itim, cursive', fontSize: '36px', marginBottom: '10px' }}>Legal Eyes Profile</h1>
      <div style={{ backgroundColor: '#2F2F2F', borderRadius: '8px', padding: '24px', margin: '20px 0' }}>
        <p style={{ fontSize: '18px', margin: '10px 0' }}>Username: <strong style={{ color: '#4caf50' }}>{user.username || user.name || 'User'}</strong></p>
        <p style={{ fontSize: '18px', margin: '10px 0' }}>Email: <strong>{user.email || 'N/A'}</strong></p>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => {
            window.location.href = '/chat';
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#fff',
            color: '#1E1E1E',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          Go to Chat
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#d1242f',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          Logout
        </button>
      </div>
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
          

          {/* Landing page at root */}
          <Route 
            path="/" 
            element={<IndexPage />} 
          />

          {/* Chat page route */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />

          {/* Documents page route */}
          <Route 
            path="/documents" 
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
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