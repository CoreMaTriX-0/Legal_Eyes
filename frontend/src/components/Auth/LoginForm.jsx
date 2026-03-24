import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <label htmlFor="username" className="form-label">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          className="form-input"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="password" className="form-label">Password</label>
          <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
        </div>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm;
