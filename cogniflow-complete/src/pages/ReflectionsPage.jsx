import React, { useState, useEffect } from 'react';
import { reflectionsService } from '../services/reflections';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { TextArea, Select } from '../components/common/Input';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './ReflectionsPage.css';

const ReflectionsPage = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    wentWell: '',
    feltHeavy: '',
    wasOverloaded: '',
    scheduleAccuracy: ''
  });

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      const data = await reflectionsService.getReflections();
      setReflections(data);
    } catch (error) {
      toast.error('Failed to load reflections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.wasOverloaded || !formData.scheduleAccuracy) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      setSubmitting(true);
      await reflectionsService.createReflection({
        ...formData,
        date: new Date()
      });
      toast.success('Reflection submitted! The AI is learning from this.');
      setFormData({
        wentWell: '',
        feltHeavy: '',
        wasOverloaded: '',
        scheduleAccuracy: ''
      });
      fetchReflections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit reflection');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading reflections..." />;

  // Check if already reflected today
  const today = new Date().toDateString();
  const hasReflectedToday = reflections.some(r =>
    new Date(r.date).toDateString() === today
  );

  return (
    <div className="reflections-page">
      <h1 className="section-title">Reflections</h1>
      <p className="section-subtitle">
        Structured feedback to help the system learn your patterns
      </p>

      {!hasReflectedToday ? (
        <Card title="📝 Today's Reflection">
          <p className="helper-text">
            Take a moment to reflect on your day. Your answers help the AI understand your patterns better.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="reflection-prompt">
              <h4>What went well today?</h4>
              <TextArea
                value={formData.wentWell}
                onChange={(e) => setFormData({ ...formData, wentWell: e.target.value })}
                placeholder="Share what worked well for you today..."
                rows={3}
              />
            </div>

            <div className="reflection-prompt">
              <h4>What felt heavy or challenging?</h4>
              <TextArea
                value={formData.feltHeavy}
                onChange={(e) => setFormData({ ...formData, feltHeavy: e.target.value })}
                placeholder="What slowed you down or felt difficult?"
                rows={3}
              />
            </div>

            <div className="reflection-prompt">
              <h4>Were you overloaded today? *</h4>
              <Select
                value={formData.wasOverloaded}
                onChange={(e) => setFormData({ ...formData, wasOverloaded: e.target.value })}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'no', label: 'No, it felt manageable' },
                  { value: 'slight', label: 'Slightly overloaded' },
                  { value: 'yes', label: 'Yes, definitely overloaded' }
                ]}
                required
              />
            </div>

            <div className="reflection-prompt">
              <h4>How accurate was today's schedule? *</h4>
              <Select
                value={formData.scheduleAccuracy}
                onChange={(e) => setFormData({ ...formData, scheduleAccuracy: e.target.value })}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'very', label: 'Very accurate - worked perfectly' },
                  { value: 'mostly', label: 'Mostly accurate - minor adjustments' },
                  { value: 'somewhat', label: 'Somewhat accurate - several changes' },
                  { value: 'not', label: 'Not accurate - didn\'t follow it' }
                ]}
                required
              />
            </div>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Reflection'}
            </Button>
          </form>
        </Card>
      ) : (
        <Card title="✅ Today's Reflection Complete">
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            You've already completed today's reflection. Come back tomorrow!
          </p>
        </Card>
      )}

      <Card title={`Past Reflections (${reflections.length})`}>
        {reflections.length > 0 ? (
          <div className="reflections-list">
            {reflections.slice(0, 10).map(reflection => (
              <ReflectionItem key={reflection._id} reflection={reflection} />
            ))}
          </div>
        ) : (
          <div className="empty-message">
            <p>📝 No reflections yet!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Complete your first daily reflection to help the AI understand your patterns.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

const ReflectionItem = ({ reflection }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="reflection-item">
      <div className="reflection-header" onClick={() => setExpanded(!expanded)}>
        <div>
          <div className="reflection-date">
            {new Date(reflection.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="reflection-summary">
            <span className={`overload-badge ${reflection.wasOverloaded}`}>
              {reflection.wasOverloaded === 'no' ? '✓ Manageable' :
               reflection.wasOverloaded === 'slight' ? '⚠ Slightly overloaded' :
               '❌ Overloaded'}
            </span>
            <span className={`accuracy-badge ${reflection.scheduleAccuracy}`}>
              Schedule: {reflection.scheduleAccuracy}
            </span>
          </div>
        </div>
        <button className="expand-btn">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="reflection-content">
          {reflection.wentWell && (
            <div className="reflection-section">
              <strong>✅ What went well:</strong>
              <p>{reflection.wentWell}</p>
            </div>
          )}
          {reflection.feltHeavy && (
            <div className="reflection-section">
              <strong>⚠️ What felt heavy:</strong>
              <p>{reflection.feltHeavy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectionsPage;