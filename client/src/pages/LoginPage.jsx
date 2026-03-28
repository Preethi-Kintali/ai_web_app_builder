import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { register, emailLogin } from '../services/authService.js';
import '../styles/login.css';

function LoginPage() {
  const { user, login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  if (user) return <Navigate to="/dashboard" />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        if (!form.name.trim()) {
          showToast('Name is required', 'error');
          setLoading(false);
          return;
        }
        result = await register(form.name.trim(), form.email.trim(), form.password);
        showToast('Account created! Welcome to Prompt2Page 🎉', 'success');
      } else {
        result = await emailLogin(form.email.trim(), form.password);
        showToast(`Welcome back, ${result.user.name}!`, 'success');
      }
      login(result.token, result.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-logo">⚡ Prompt2Page</div>
        <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="login-card-subtitle">
          {isSignUp
            ? 'Start building AI-powered web apps for free.'
            : 'Sign in to continue building amazing apps.'}
        </p>

        <div className="login-tabs">
          <button
            className={`login-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required={isSignUp}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-back-link">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
