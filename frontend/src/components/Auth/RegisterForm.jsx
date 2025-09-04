import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const RegisterForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
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
          Email address
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
        />
      </div>

      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className={`form-input ${validationErrors.username ? 'error' : ''}`}
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />
        {validationErrors.username && (
          <div className="field-error">{validationErrors.username}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${validationErrors.password ? 'error' : ''}`}
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        {validationErrors.password && (
          <div className="field-error">{validationErrors.password}</div>
        )}
        <div className="password-hint">
          Use at least 8 characters with a mix of letters, numbers & symbols
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        {validationErrors.confirmPassword && (
          <div className="field-error">{validationErrors.confirmPassword}</div>
        )}
      </div>

      <div className="terms-agreement">
        <p>
          By creating an account, you agree to the{' '}
          <Link to="/terms" className="link">Terms of Service</Link>{' '}
          and{' '}
          <Link to="/privacy" className="link">Privacy Policy</Link>.
        </p>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
};

export default RegisterForm;
