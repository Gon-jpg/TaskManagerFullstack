import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Homepage.css';

const Homepage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div className="homepage-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <h2>TaskMaster</h2>
          </div>
          <div className="nav-links">
            {token ? (
              <Link to="/dashboard" className="nav-link primary">
                Dashboard
              </Link>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Organize Your Life with
              <span className="gradient-text"> TaskMaster</span>
            </h1>
            <p className="hero-subtitle">
              The ultimate task management solution that helps you stay productive,
              organized, and focused on what matters most. Create, categorize,
              and track your tasks with ease.
            </p>
            
            {!token ? (
              <div className="hero-actions">
                <Link to="/register" className="cta-button primary">
                  Start Managing Tasks
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/dashboard" className="cta-button primary">
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="hero-visual">
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Organize Tasks</h3>
                <p>Create and categorize your tasks efficiently</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3>Track Progress</h3>
                <p>Monitor your productivity and completion rates</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Stay Focused</h3>
                <p>Filter and prioritize what needs to be done</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose TaskMaster?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <h3>Simple & Intuitive</h3>
              <p>Clean, user-friendly interface that makes task management effortless</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">02</div>
              <h3>Smart Categories</h3>
              <p>Organize your tasks into meaningful categories for better workflow</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">03</div>
              <h3>Real-time Updates</h3>
              <p>Instant synchronization and updates across all your activities</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">04</div>
              <h3>Progress Tracking</h3>
              <p>Visual progress indicators to keep you motivated and on track</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="homepage-footer">
        <div className="container">
          <p>&copy; 2024 TaskMaster. Built with React & Spring Boot.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;