import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <div className="error-text">{error}</div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Username or email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          className="form-input"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm;
