import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/Auth/AuthLayout';
import RegisterForm from '../components/Auth/RegisterForm';
import { registerUser } from '../utils/authApi';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const response = await registerUser(formData);
      
      // Store token in localStorage (or use a state management solution)
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to dashboard or welcome page
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create your account"
      subtitle="Join Legal Eyes and start managing your legal documents securely"
    >
      <RegisterForm 
        onSubmit={handleRegister}
        loading={loading}
        error={error}
      />
      
      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
