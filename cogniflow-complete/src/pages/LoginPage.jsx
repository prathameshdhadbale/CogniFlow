import React, { useState } from 'react';
import { useStore } from '../store';
import { authService } from '../services/auth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const setUser = useStore(state => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authService.login({
          email: formData.email,
          password: formData.password
        });
        setUser(data.user);
        toast.success('Welcome back!');
      } else {
        const data = await authService.register(formData);
        setUser(data.user);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="logo">Cogni<span>Flow</span></h1>
          <p className="tagline">Your intelligent personal scheduling system</p>
        </div>

        <div className="login-card">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="subtitle">
            {isLogin ? 'Sign in to continue' : 'Start your journey to better productivity'}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="toggle-auth">
            <button onClick={() => setIsLogin(!isLogin)} type="button">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🧠</span>
            <h3>AI-Powered Scheduling</h3>
            <p>Let the system learn your patterns and optimize your time</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Pattern Recognition</h3>
            <p>Understand your peak performance times and load tolerance</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💭</span>
            <h3>Thought Processing</h3>
            <p>Share insights and let AI adjust your schedule accordingly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
