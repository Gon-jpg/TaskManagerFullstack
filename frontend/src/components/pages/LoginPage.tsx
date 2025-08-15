import React from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../../styles/LoginPage.css';

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      setStatus(null);
      await login(values);
    } catch (error: any) {
      setSubmitting(false);
      setStatus('Login failed. Please check your username and password.'); 
      console.error('Login failed', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="login-form">
              {status && (
                <div className="error-message global-error">
                  {status}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  className="form-input"
                  placeholder="Enter your username"
                />
                <ErrorMessage 
                  name="username" 
                  component="div" 
                  className="error-message" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                />
                <ErrorMessage 
                  name="password" 
                  component="div" 
                  className="error-message" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`login-button ${isSubmitting ? 'loading' : ''}`}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="login-link">
              Sign up here
            </Link>
          </p>
          <Link to="/" className="login-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;