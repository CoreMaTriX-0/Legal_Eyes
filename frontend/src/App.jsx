import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IndexPage from './pages/index';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import HistoryPage from './pages/HistoryPage';
import Sidebar from './components/Sidebar/Sidebar';
import { isAuthenticated, clearAuthData } from './utils/authApi';
import './styles/global.css';
import './components/Auth/Auth.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Public Route component
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

// Dashboard component
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-card animate-scale-in">
          <div className="dashboard-avatar">
            <span className="dashboard-avatar-text">
              {(user.username || user.name || 'U')[0].toUpperCase()}
            </span>
          </div>
          <h1 className="dashboard-name">{user.username || user.name || 'User'}</h1>
          <p className="dashboard-email">{user.email || 'No email set'}</p>

          <div className="dashboard-actions">
            <button className="dashboard-btn primary" onClick={() => navigate('/chat')}>
              Go to Chat
            </button>
            <button className="dashboard-btn danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .dashboard-content {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
        }
        .dashboard-card {
          text-align: center;
          max-width: 400px;
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 48px 36px;
          animation: scaleIn var(--transition-smooth) ease-out both;
        }
        .dashboard-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .dashboard-avatar-text {
          font-family: var(--font-heading);
          font-size: 32px;
          font-weight: 700;
          color: var(--accent);
        }
        .dashboard-name {
          font-family: var(--font-heading);
          font-size: 28px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .dashboard-email {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 32px;
        }
        .dashboard-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .dashboard-btn {
          padding: 11px 24px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
          border: none;
          cursor: pointer;
        }
        .dashboard-btn.primary {
          background: var(--accent);
          color: #fff;
        }
        .dashboard-btn.primary:hover {
          background: var(--accent-hover);
          box-shadow: var(--shadow-glow);
          transform: translateY(-1px);
        }
        .dashboard-btn.danger {
          background: var(--error-muted);
          color: var(--error);
        }
        .dashboard-btn.danger:hover {
          background: var(--error);
          color: #fff;
          transform: translateY(-1px);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
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

          {/* Landing page */}
          <Route path="/" element={<IndexPage />} />

          {/* Chat */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* History */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Documents */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;