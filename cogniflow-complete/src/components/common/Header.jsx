import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore(state => state.logout);
  const user = useStore(state => state.user);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'checklist' },
    { path: '/schedule', label: 'Schedule', icon: 'calendar' },
    { path: '/thoughts', label: 'Thoughts', icon: 'lightbulb' },
    { path: '/reflections', label: 'Reflections', icon: 'auto_stories' },
    { path: '/insights', label: 'Insights', icon: 'insights' },
    { path: '/chat', label: 'Assistant', icon: 'smart_toy' },
  ];

  return (
    <header className="header-pro">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-pro" onClick={() => navigate('/')}>
            <div className="logo-icon">CF</div>
            <div className="logo-text">
              <span className="logo-name">CogniFlow</span>
              <span className="logo-tagline">AI Scheduling</span>
            </div>
          </div>
        </div>

        <nav className="nav-pro">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="material-icons nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="logout-btn" onClick={logout}>
              <span className="material-icons">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;