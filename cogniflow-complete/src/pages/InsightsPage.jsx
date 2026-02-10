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
