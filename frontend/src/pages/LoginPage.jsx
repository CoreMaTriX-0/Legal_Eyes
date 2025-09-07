import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/Auth/AuthLayout';
import LoginForm from '../components/Auth/LoginForm';
import { loginUser } from '../utils/authApi';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      // Store JWT access token
      if (response.access) {
        localStorage.setItem('token', response.access);
      }
      // Optionally store user info if returned
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to Legal Eyes">
      <LoginForm 
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />
      
      <div className="auth-footer">
        <p>
          New to Legal Eyes?{' '}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
