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
    if (!newThought.trim()) return;

    try {
      setSubmitting(true);
      await thoughtsService.createThought(newThought);
      toast.success('Thought saved and being processed by AI!');
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

      <Card title="New Thought">
        <p className="helper-text">
          Share work thoughts, schedule frustrations, energy levels, or anything that affects your productivity
        </p>
        <form onSubmit={handleSubmit}>
          <TextArea
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Example: 'I've been feeling more energized in the mornings lately...' or 'Planning sessions drain me...' or 'I keep postponing this type of task...'"
            rows={6}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Processing...' : 'Save Thought'}
          </Button>
        </form>
      </Card>

      <Card title="Recent Thoughts">
        {thoughts.length > 0 ? (
          <div className="thoughts-list">
            {thoughts.map(thought => (
              <div key={thought._id} className="thought-item">
                <p className="thought-content">"{thought.content}"</p>
                <p className="thought-meta">
                  {new Date(thought.createdAt).toLocaleDateString()} • 
                  {thought.affectedScheduling ? ' Used in scheduling' : ' Being processed'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No thoughts yet. Start sharing your insights!</p>
        )}
      </Card>
    </div>
  );
};

export default ThoughtsPage;
