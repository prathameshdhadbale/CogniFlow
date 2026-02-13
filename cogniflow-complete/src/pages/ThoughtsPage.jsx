import React, { useState, useEffect } from 'react';
import { thoughtsService } from '../services/thoughts';
import Button from '../components/common/Button';
import { TextArea } from '../components/common/Input';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './ThoughtsPage.css';

const ThoughtsPage = () => {
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      const data = await thoughtsService.getThoughts();
      setThoughts(data);
    } catch (error) {
      toast.error('Failed to load thoughts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newThought.trim()) {
      toast.error('Please enter a thought');
      return;
    }

    try {
      setSubmitting(true);
      await thoughtsService.createThought(newThought);
      toast.success('Thought saved');
      setNewThought('');
      fetchThoughts();
    } catch (error) {
      toast.error('Failed to save thought');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading thoughts..." />;

  return (
    <div className="thoughts-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Thoughts</h1>
          <p className="page-subtitle">Capture insights about your productivity patterns</p>
        </div>
      </div>

      <div className="thought-capture-card">
        <div className="capture-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Share Your Thoughts</h3>
        </div>
        <p className="capture-description">
          Share insights about your work patterns, energy levels, or productivity preferences.
          The AI will analyze these to optimize your schedule.
        </p>
        <form onSubmit={handleSubmit}>
          <TextArea
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Example: I work best in the mornings when it's quiet, or planning sessions help me stay focused..."
            rows={4}
          />
          <Button type="submit" variant="primary" disabled={submitting || !newThought.trim()}>
            {submitting ? 'Saving...' : 'Save Thought'}
          </Button>
        </form>
      </div>

      <div className="thoughts-list-section">
        <h3 className="section-title">Your Thoughts ({thoughts.length})</h3>
        {thoughts.length > 0 ? (
          <div className="thoughts-grid">
            {thoughts.map(thought => (
              <ThoughtCard key={thought._id} thought={thought} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21.3333 32H42.6667M32 21.3333V42.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="empty-title">No thoughts yet</h3>
            <p className="empty-description">Share your first thought to help AI understand your work patterns</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ThoughtCard = ({ thought }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const hasInsights = thought.processedInsights && thought.processedInsights.length > 0;

  const getInsightColor = (type) => {
    const colors = {
      energy: 'var(--warning)',
      preference: 'var(--info)',
      frustration: 'var(--error)',
      habit: 'var(--success)'
    };
    return colors[type] || 'var(--gray-500)';
  };

  return (
    <div className="thought-card">
      <div className="thought-content">
        <p className="thought-text">{thought.content}</p>
        <div className="thought-footer">
          <span className="thought-date">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 4V8L10.6667 9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {formatDate(thought.createdAt)}
          </span>
          {hasInsights && (
            <span className="insights-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6.66667 8.66667L8 10L12 6M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {thought.processedInsights.length} AI insight{thought.processedInsights.length !== 1 ? 's' : ''}
            </span>
          )}
          {thought.affectedScheduling && (
            <span className="used-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Used in scheduling
            </span>
          )}
        </div>
      </div>

      {hasInsights && (
        <>
          <button
            className="insights-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide' : 'View'} AI Insights
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d={expanded ? "M15 12.5L10 7.5L5 12.5" : "M5 7.5L10 12.5L15 7.5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {expanded && (
            <div className="insights-list">
              {thought.processedInsights.map((insight, idx) => (
                <div key={idx} className="insight-item">
                  <div className="insight-header">
                    <span
                      className="insight-type"
                      style={{ backgroundColor: getInsightColor(insight.type) }}
                    >
                      {insight.type}
                    </span>
                    <span className="insight-confidence">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="insight-signal">{insight.signal}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThoughtsPage;