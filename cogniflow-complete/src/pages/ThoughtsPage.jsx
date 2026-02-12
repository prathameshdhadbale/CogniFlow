import React, { useState, useEffect } from 'react';
import { thoughtsService } from '../services/thoughts';
import Card from '../components/common/Card';
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
      toast.success('Thought saved! AI is processing it...');
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
    <div className="thoughts-page">
      <h1 className="section-title">Thoughts</h1>
      <p className="section-subtitle">
        Capture unstructured thoughts that help the system understand you better
      </p>

      <Card title="💭 Share a Thought">
        <p className="helper-text">
          Tell me about your work style, energy levels, what frustrates you, or what works well.
          The AI will analyze your thoughts to optimize your schedule.
        </p>
        <form onSubmit={handleSubmit}>
          <TextArea
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Example: 'I work best in the mornings when it's quiet...' or 'Planning sessions drain me...' or 'I keep postponing documentation tasks...'"
            rows={6}
          />
          <Button type="submit" variant="primary" disabled={submitting || !newThought.trim()}>
            {submitting ? '🤖 Processing...' : 'Save Thought'}
          </Button>
        </form>
      </Card>

      <Card title={`Recent Thoughts (${thoughts.length})`}>
        {thoughts.length > 0 ? (
          <div className="thoughts-list">
            {thoughts.map(thought => (
              <ThoughtItem key={thought._id} thought={thought} />
            ))}
          </div>
        ) : (
          <div className="empty-message">
            <p>💭 No thoughts yet!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Share your first thought to help the AI understand your work style.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

const ThoughtItem = ({ thought }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const hasInsights = thought.processedInsights && thought.processedInsights.length > 0;

  return (
    <div className="thought-item">
      <div className="thought-content">
        <div className="thought-text">"{thought.content}"</div>
        <div className="thought-meta">
          <span>{formatDate(thought.createdAt)}</span>
          {hasInsights && (
            <>
              <span>•</span>
              <span className="insights-badge">
                {thought.processedInsights.length} AI insight{thought.processedInsights.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
          {thought.affectedScheduling && (
            <>
              <span>•</span>
              <span className="affected-badge">✓ Used in scheduling</span>
            </>
          )}
        </div>
      </div>

      {hasInsights && (
        <div className="thought-insights">
          <button
            className="insights-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'} View AI Insights
          </button>

          {expanded && (
            <div className="insights-content">
              {thought.processedInsights.map((insight, idx) => (
                <div key={idx} className="insight-item">
                  <div className="insight-header">
                    <span className={`insight-type ${insight.type}`}>
                      {insight.type}
                    </span>
                    <span className="insight-confidence">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="insight-signal">{insight.signal}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThoughtsPage;