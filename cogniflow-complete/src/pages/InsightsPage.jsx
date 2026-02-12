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

  const peakHour = insights?.peakHours?.[0] || 14;
  const peakHourEnd = insights?.peakHours?.[insights.peakHours.length - 1] || 16;

  return (
    <div className="insights-page">
      <h1 className="section-title">Insights</h1>
      <p className="section-subtitle">Understanding how you work best</p>

      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-number">
            {peakHour}:00 - {peakHourEnd}:00
          </div>
          <div className="insight-label">Your Peak Performance Time</div>
          <p className="insight-detail">
            Based on your task completion patterns
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-number">{insights?.completionRate || 0}%</div>
          <div className="insight-label">Task Completion Rate</div>
          <p className="insight-detail">
            {insights?.completionRate > 75 ? 'Excellent progress!' :
             insights?.completionRate > 50 ? 'Good work!' :
             'Keep going!'}
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-number">{insights?.optimalTaskCount || 3} tasks</div>
          <div className="insight-label">Optimal Daily Load</div>
          <p className="insight-detail">
            Your sweet spot for productivity
          </p>
        </div>

        <div className="insight-card">
          <div className="insight-number">{patterns?.consistencyStreak || 0} days</div>
          <div className="insight-label">Consistency Streak</div>
          <p className="insight-detail">
            {patterns?.consistencyStreak > 7 ? 'Amazing streak!' :
             patterns?.consistencyStreak > 3 ? 'Building momentum!' :
             'Start your streak today!'}
          </p>
        </div>
      </div>

      <Card title="📊 Key Patterns">
        <div className="patterns-list">
          <div className="pattern-item">
            <h4>⏰ Peak Performance Hours</h4>
            <p>
              Your data shows you're most productive between{' '}
              <strong>{peakHour}:00 - {peakHourEnd}:00</strong>.
              Schedule your most important tasks during this window for best results.
            </p>
          </div>

          <div className="pattern-item">
            <h4>🎯 Optimal Task Load</h4>
            <p>
              You perform best with <strong>{insights?.optimalTaskCount || 3} tasks</strong> per day.
              Your load tolerance is <strong>{insights?.loadTolerance || 'medium'}</strong>.
              {insights?.loadTolerance === 'low' && ' Consider breaking large tasks into smaller chunks.'}
              {insights?.loadTolerance === 'high' && ' You handle multiple tasks well!'}
            </p>
          </div>

          <div className="pattern-item">
            <h4>📈 Task Completion Performance</h4>
            <p>
              Current completion rate: <strong>{insights?.completionRate || 0}%</strong>.
              {insights?.completionRate > 80 && ' Excellent! Youre crushing your goals.'}
              {insights?.completionRate > 60 && insights?.completionRate <= 80 && ' Good progress! Keep it up.'}
              {insights?.completionRate <= 60 && ' Focus on completing fewer tasks fully rather than starting many.'}
            </p>
          </div>

          <div className="pattern-item">
            <h4>🔄 Recent Activity</h4>
            <p>
              Recent reflections: <strong>{patterns?.recentReflections || 0}</strong> in the last week.
              {patterns?.recentReflections === 0 && ' Start logging reflections to help the AI understand you better!'}
              {patterns?.recentReflections > 5 && ' Great self-awareness! The AI is learning your patterns.'}
            </p>
          </div>
        </div>
      </Card>

      {(!insights || insights.completionRate === 0) && (
        <Card title="💡 Getting Started">
          <div className="getting-started">
            <p>
              <strong>Build your insights!</strong> CogniFlow learns from your actual behavior:
            </p>
            <ul>
              <li>✅ Create and complete tasks regularly</li>
              <li>💭 Share thoughts about your work style</li>
              <li>📝 Log daily reflections</li>
              <li>🤖 Use AI scheduling to optimize your time</li>
            </ul>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              The more you use CogniFlow, the smarter it gets about your productivity patterns!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InsightsPage;