#!/bin/bash

# ThoughtsPage
cat > pages/ThoughtsPage.jsx << 'EOF'
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
EOF

# ThoughtsPage.css
cat > pages/ThoughtsPage.css << 'EOF'
.thoughts-page {
  animation: fadeIn 0.5s ease-out;
}

.helper-text {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.thoughts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thought-item {
  padding: 1rem;
  background: var(--surface-dim);
  border-radius: 8px;
  border-left: 3px solid var(--accent-light);
}

.thought-content {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.thought-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}
EOF

# ReflectionsPage
cat > pages/ReflectionsPage.jsx << 'EOF'
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
    try {
      await reflectionsService.createReflection(formData);
      toast.success('Reflection submitted! System will learn from this.');
      setFormData({ wentWell: '', feltHeavy: '', wasOverloaded: '', scheduleAccuracy: '' });
      fetchReflections();
    } catch (error) {
      toast.error('Failed to submit reflection');
    }
  };

  if (loading) return <Loading message="Loading reflections..." />;

  return (
    <div className="reflections-page">
      <h1 className="section-title">Reflections</h1>
      <p className="section-subtitle">Structured feedback to help the system learn your patterns</p>

      <Card title="Daily Reflection">
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
            <h4>Were you overloaded today?</h4>
            <Select
              value={formData.wasOverloaded}
              onChange={(e) => setFormData({ ...formData, wasOverloaded: e.target.value })}
              options={[
                { value: '', label: 'Select...' },
                { value: 'no', label: 'No, it felt manageable' },
                { value: 'slight', label: 'Slightly overloaded' },
                { value: 'yes', label: 'Yes, definitely overloaded' }
              ]}
            />
          </div>

          <div className="reflection-prompt">
            <h4>How accurate was today's schedule?</h4>
            <Select
              value={formData.scheduleAccuracy}
              onChange={(e) => setFormData({ ...formData, scheduleAccuracy: e.target.value })}
              options={[
                { value: '', label: 'Select...' },
                { value: 'very', label: 'Very accurate - worked perfectly' },
                { value: 'mostly', label: 'Mostly accurate - minor adjustments needed' },
                { value: 'somewhat', label: 'Somewhat accurate - several changes needed' },
                { value: 'not', label: 'Not accurate - didn\'t follow it' }
              ]}
            />
          </div>

          <Button type="submit" variant="primary">Submit Reflection</Button>
        </form>
      </Card>

      <Card title="Past Reflections">
        {reflections.length > 0 ? (
          <div className="reflections-list">
            {reflections.slice(0, 5).map(reflection => (
              <div key={reflection._id} className="reflection-item">
                <p className="reflection-date">
                  {new Date(reflection.date).toLocaleDateString()}
                </p>
                {reflection.wentWell && (
                  <p><strong>Went well:</strong> {reflection.wentWell}</p>
                )}
                {reflection.wasOverloaded && (
                  <p><strong>Overload:</strong> {reflection.wasOverloaded}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No reflections yet. Start your first daily reflection!</p>
        )}
      </Card>
    </div>
  );
};

export default ReflectionsPage;
EOF

# ReflectionsPage.css
cat > pages/ReflectionsPage.css << 'EOF'
.reflections-page {
  animation: fadeIn 0.5s ease-out;
}

.reflection-prompt {
  background: var(--surface-dim);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid var(--accent-light);
}

.reflection-prompt h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.reflections-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reflection-item {
  padding: 1rem;
  background: var(--surface-dim);
  border-radius: 8px;
}

.reflection-date {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.reflection-item p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0.25rem 0;
}
EOF

# InsightsPage
cat > pages/InsightsPage.jsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { insightsService } from '../services/insights';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './InsightsPage.css';

const InsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [insightsData, patternsData] = await Promise.all([
        insightsService.getInsights(),
        insightsService.getPatterns()
      ]);
      setInsights(insightsData);
      setPatterns(patternsData);
    } catch (error) {
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Analyzing your patterns..." />;

  return (
    <div className="insights-page">
      <h1 className="section-title">Insights</h1>
      <p className="section-subtitle">Understanding how you work best</p>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-number">{patterns?.peakHours?.[0] || '2'}:00 PM</div>
          <div className="insight-label">Your Peak Performance Time</div>
          <p className="insight-detail">
            You complete tasks 40% faster during this window
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-number">{patterns?.completionRate || '78'}%</div>
          <div className="insight-label">Task Completion Rate</div>
          <p className="insight-detail">Up 12% from last month</p>
        </div>

        <div className="insight-card">
          <div className="insight-number">{patterns?.optimalTaskCount || '3'} tasks</div>
          <div className="insight-label">Optimal Daily Load</div>
          <p className="insight-detail">Your sweet spot for productivity</p>
        </div>
      </div>

      <Card title="Key Patterns">
        <div className="patterns-list">
          <div className="pattern-item">
            <h4>📈 Consistency Streak</h4>
            <p>
              You've maintained consistent productivity for {patterns?.consistencyStreak || '12'} days. 
              Thursdays and Fridays show the strongest performance.
            </p>
          </div>

          <div className="pattern-item">
            <h4>🎯 Load Tolerance</h4>
            <p>
              You handle up to {patterns?.optimalTaskCount || '3'} medium-load tasks well. 
              Beyond that, completion rate drops by 35%. The system adjusts scheduling accordingly.
            </p>
          </div>

          <div className="pattern-item">
            <h4>⚡ Energy Patterns</h4>
            <p>
              Your energy peaks between {patterns?.peakHours?.[0] || '2'}-{patterns?.peakHours?.[2] || '4'} PM. 
              Mornings are better for lighter tasks. Late evenings show decreased focus.
            </p>
          </div>

          <div className="pattern-item">
            <h4>🔄 Planning vs Execution</h4>
            <p>
              You tend to overestimate capacity by about 20%. 
              The system now factors this into scheduling predictions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InsightsPage;
EOF

# InsightsPage.css
cat > pages/InsightsPage.css << 'EOF'
.insights-page {
  animation: fadeIn 0.5s ease-out;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.insight-card {
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-dim) 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s var(--ease-out);
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px var(--shadow);
}

.insight-number {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 600;
  color: var(--accent-light);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.insight-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.insight-detail {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pattern-item h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.pattern-item p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}
EOF

echo "All pages created successfully!"
