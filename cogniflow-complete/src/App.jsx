import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ThoughtsPage from './pages/ThoughtsPage';
import ReflectionsPage from './pages/ReflectionsPage';
import InsightsPage from './pages/InsightsPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/thoughts" element={<ThoughtsPage />} />
            <Route path="/reflections" element={<ReflectionsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
