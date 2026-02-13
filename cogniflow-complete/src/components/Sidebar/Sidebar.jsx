import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import './Sidebar.css';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore(state => state.logout);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✓' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/thoughts', label: 'Thoughts', icon: '💭' },
    { path: '/reflections', label: 'Reflections', icon: '📖' },
    { path: '/insights', label: 'Insights', icon: '📈' },
    { path: '/chat', label: 'AI Assistant', icon: '🤖' },
  ];

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">CF</div>
          <div className="logo-content">
            <span className="logo-text">CogniFlow</span>
            <span className="logo-tagline">AI Productivity</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Menu</div>
          {navItems.map(item => (
            <button
              key={item.path}
              type="button"
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {location.pathname === item.path && <div className="nav-indicator" />}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="logout-btn" onClick={logout} aria-label="Log out">
          <span className="logout-icon" aria-hidden>→</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;