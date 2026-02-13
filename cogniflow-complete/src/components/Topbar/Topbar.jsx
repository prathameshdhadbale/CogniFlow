import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import './Topbar.css';

const Topbar = ({ onMenuClick, sidebarOpen }) => {
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || '');
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/tasks?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        {onMenuClick && (
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={onMenuClick}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={!!sidebarOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <form className="search-container" onSubmit={handleSearchSubmit} role="search">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="search"
            placeholder="Search tasks, thoughts, reflections..."
            className="search-input"
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V10L13.3333 11.6667M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="topbar-icon-btn notification-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15.8333V16.6667C7.5 18.0474 8.61929 19.1667 10 19.1667C11.3807 19.1667 12.5 18.0474 12.5 16.6667V15.8333M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 9.49239 4.20119 11.2018 3.34673 12.3462C2.61515 13.3213 2.24936 13.8089 2.25924 13.9555C2.27043 14.1175 2.31463 14.1889 2.44681 14.2827C2.56576 14.3667 3.06345 14.3667 4.05882 14.3667H15.9412C16.9365 14.3667 17.4342 14.3667 17.5532 14.2827C17.6854 14.1889 17.7296 14.1175 17.7408 13.9555C17.7506 13.8089 17.3849 13.3213 16.6533 12.3462C15.7988 11.2018 15 9.49239 15 6.66667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="notification-badge"></span>
        </button>
        <div className="user-menu">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || 'user@example.com'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;