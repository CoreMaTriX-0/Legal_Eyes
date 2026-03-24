import React from 'react';
import './Auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="logo">
            <img src="/legaleye logo.png" alt="Legal Eyes" className="logo-img" />
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
