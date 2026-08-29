import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { logout as logoutAPI } from '../services/authService.js';
import SettingsPanel from './SettingsPanel.jsx';
import '../styles/navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (e) {}
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/', { replace: true });
  };

  return (
    <>
      <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-brand-icon">⚡</div>
          <span>Prompt2Page</span>
        </Link>

        <div className="navbar-spacer" />

        <div className={`navbar-links ${mobileMenuOpen ? 'show' : ''}`}>
          <Link
            to="/dashboard"
            className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Projects
          </Link>
          {user && (
            <button 
              className="navbar-link mobile-only" 
              onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }}
            >
              AI Settings
            </button>
          )}
          {user && (
            <button 
              className="navbar-link mobile-only logout" 
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
            >
              Logout
            </button>
          )}
        </div>

        <div className="navbar-divider hide-mobile" />

        {user && (
          <div className="navbar-user hide-mobile">
            <button
              className="navbar-settings-btn"
              onClick={() => setShowSettings(true)}
              title="AI Generation Settings"
            >
              ⚙️
            </button>
            <div className="navbar-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="navbar-username">{user.name}</span>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        {user && (
          <button 
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </nav>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          showToast={showToast}
        />
      )}
    </>
  );
}

export default Navbar;
