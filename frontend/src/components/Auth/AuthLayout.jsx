import React from 'react';
import './Auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="logo">
            <svg height="32" width="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" />
            </svg>
            <span className="logo-text">Legal Eyes</span>
          </div>
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
