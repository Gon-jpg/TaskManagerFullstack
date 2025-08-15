import React from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { usersAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/RegisterPage.css';

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .required('Username is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setFieldError, setStatus }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      setStatus(null);
      const { confirmPassword, ...registerData } = values;
      
      await usersAPI.create(registerData); 

      toast.success('Registration successful! Please login.');
      setStatus({ type: 'success', message: 'Registration successful! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setSubmitting(false);
      if (error.response?.status === 409) {
        setFieldError('username', 'This username is already taken');
        setStatus({ type: 'error', message: 'Username taken.' });
        toast.error('Username is already taken.');
      } else if (error.response?.data?.message) {
        setStatus({ type: 'error', message: error.response.data.message });
        toast.error(error.response.data.message);
      } else {
        setStatus({ type: 'error', message: 'Registration failed. Please try again.' });
        toast.error('Registration failed. Please try again.');
      }
      console.error('Registration failed', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join us to manage your tasks efficiently</p>
        
        <Formik
          initialValues={{ username: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="register-form">
              {status && (
                <div className={`status-message ${status.type === 'success' ? 'success' : 'error'}`}>
                  {status.message}
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
                  placeholder="Choose a username"
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
                  placeholder="Create a strong password"
                />
                <ErrorMessage 
                  name="password" 
                  component="div" 
                  className="error-message" 
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                />
                <ErrorMessage 
                  name="confirmPassword" 
                  component="div" 
                  className="error-message" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`register-button ${isSubmitting ? 'loading' : ''}`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="register-link">
              Sign in here
            </Link>
          </p>
          <Link to="/" className="register-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;