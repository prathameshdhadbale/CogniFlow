import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import DashboardPage from './pages/DashboardPage1';
import TasksPage from './pages/TasksPage';
import ThoughtsPage from './pages/ThoughtsPage';
import ReflectionsPage from './pages/ReflectionsPage';
import InsightsPage from './pages/InsightsPage';
import ChatPage from './pages/ChatPage';
import SchedulePage from './pages/SchedulePage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--error)',
                secondary: 'white',
              },
            },
          }}
        />
      </>
    );
  }

  return (
    <Router>
      <a href="#app-content" className="skip-link">
        Skip to main content
      </a>
      <div className="app">
        <div className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <div
          className="app-sidebar-overlay"
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        />
        <div className="app-main">
          <div className="app-topbar">
            <Topbar
              onMenuClick={() => setSidebarOpen((v) => !v)}
              sidebarOpen={sidebarOpen}
            />
          </div>
          <div id="app-content" className="app-content" role="main">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/thoughts" element={<ThoughtsPage />} />
              <Route path="/reflections" element={<ReflectionsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error)',
              secondary: 'white',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;