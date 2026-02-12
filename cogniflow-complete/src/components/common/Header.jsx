import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore(state => state.logout);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/thoughts', label: 'Thoughts' },
    { path: '/reflections', label: 'Reflections' },
    { path: '/insights', label: 'Insights' },
    { path: '/chat', label: 'Assistant' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          Cogni<span>Flow</span>
        </div>
        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-btn logout-btn" onClick={logout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;