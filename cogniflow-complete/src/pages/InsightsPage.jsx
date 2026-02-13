import React, { useEffect, useState } from 'react';
import { insightsService } from '../services/insights';
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

  if (loading) return <Loading message="Loading insights..." />;

  const peakHourStart = insights?.peakHours?.[0] || 14;
  const peakHourEnd = insights?.peakHours?.[insights.peakHours.length - 1] || 16;

  return (
    <div className="insights-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-subtitle">AI-powered analytics and recommendations</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Peak Hours</div>
          <div className="metric-value">{peakHourStart}:00 - {peakHourEnd}:00</div>
          <div className="metric-trend positive">Best focus time</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Completion Rate</div>
          <div className="metric-value">{insights?.completionRate || 0}%</div>
          <div className="metric-trend positive">
            {insights?.completionRate > 75 ? 'Excellent' :
             insights?.completionRate > 50 ? 'Good' : 'Improving'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Optimal Load</div>
          <div className="metric-value">{insights?.optimalTaskCount || 3}</div>
          <div className="metric-trend neutral">Tasks per day</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Streak</div>
          <div className="metric-value">{patterns?.consistencyStreak || 0}</div>
          <div className="metric-trend positive">Consecutive days</div>
        </div>
      </div>

      {/* Patterns Analysis */}
      <div className="patterns-container">
        <h3 className="section-title">Productivity Patterns</h3>
        <div className="patterns-grid">
          <div className="pattern-card">
            <div className="pattern-icon">⏰</div>
            <h4 className="pattern-title">Peak Performance</h4>
            <p className="pattern-description">
              You're most productive between {peakHourStart}:00 - {peakHourEnd}:00.
              Schedule important tasks during these hours.
            </p>
          </div>

          <div className="pattern-card">
            <div className="pattern-icon">🎯</div>
            <h4 className="pattern-title">Task Load</h4>
            <p className="pattern-description">
              You perform best with {insights?.optimalTaskCount || 3} tasks per day.
              Load tolerance: {insights?.loadTolerance || 'medium'}.
            </p>
          </div>

          <div className="pattern-card">
            <div className="pattern-icon">📊</div>
            <h4 className="pattern-title">Performance</h4>
            <p className="pattern-description">
              Current completion rate: {insights?.completionRate || 0}%.
              {insights?.completionRate > 80 ? ' Excellent progress!' :
               insights?.completionRate > 60 ? ' Good work!' :
               ' Focus on completing tasks fully.'}
            </p>
          </div>

          <div className="pattern-card">
            <div className="pattern-icon">🔄</div>
            <h4 className="pattern-title">Activity</h4>
            <p className="pattern-description">
              {patterns?.recentReflections || 0} reflections in the last week.
              {patterns?.recentReflections > 5 ? ' Great self-awareness!' :
               ' Log more reflections to improve insights.'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {(!insights || insights.completionRate === 0) && (
        <div className="recommendations-container">
          <h3 className="section-title">Get Started</h3>
          <p className="recommendations-description">
            CogniFlow learns from your behavior to provide personalized insights:
          </p>
          <ul className="recommendations-list">
            <li>Create and complete tasks regularly</li>
            <li>Share thoughts about your work style</li>
            <li>Log daily reflections</li>
            <li>Use AI scheduling to optimize your time</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;