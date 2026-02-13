import React, { useState, useEffect } from 'react';
import { reflectionsService } from '../services/reflections';
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
      toast.success('Reflection saved');
      setFormData({
        wentWell: '',
        feltHeavy: '',
        wasOverloaded: '',
        scheduleAccuracy: ''
      });
      fetchReflections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save reflection');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading reflections..." />;

  const today = new Date().toDateString();
  const hasReflectedToday = reflections.some(r =>
    new Date(r.date).toDateString() === today
  );

  return (
    <div className="reflections-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Reflections</h1>
          <p className="page-subtitle">Review your day and help AI learn</p>
        </div>
      </div>

      {!hasReflectedToday ? (
        <div className="reflection-form-card">
          <div className="reflection-form-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Today's Reflection</h3>
          </div>
          <p className="reflection-form-description">
            Take a moment to reflect on your day. Your insights help the AI optimize your schedule.
          </p>

          <form onSubmit={handleSubmit} className="reflection-form">
            <div className="form-section">
              <label className="form-label">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.66667 11.6667C6.66667 11.6667 7.91667 13.3333 10 13.3333C12.0833 13.3333 13.3333 11.6667 13.3333 11.6667M7.5 7.5H7.50833M12.5 7.5H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                What went well today?
              </label>
              <TextArea
                value={formData.wentWell}
                onChange={(e) => setFormData({ ...formData, wentWell: e.target.value })}
                placeholder="Share what worked well for you..."
                rows={3}
              />
            </div>

            <div className="form-section">
              <label className="form-label">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.66667 12.5C6.66667 12.5 7.91667 10.8333 10 10.8333C12.0833 10.8333 13.3333 12.5 13.3333 12.5M7.5 7.5H7.50833M12.5 7.5H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                What felt challenging?
              </label>
              <TextArea
                value={formData.feltHeavy}
                onChange={(e) => setFormData({ ...formData, feltHeavy: e.target.value })}
                placeholder="What slowed you down or felt difficult?"
                rows={3}
              />
            </div>

            <div className="form-section">
              <label className="form-label required">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 1.66667V5M10 15V18.3333M18.3333 10H15M5 10H1.66667M15.8917 15.8917L13.5333 13.5333M15.8917 4.10833L13.5333 6.46667M4.10833 15.8917L6.46667 13.5333M4.10833 4.10833L6.46667 6.46667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Were you overloaded today?
              </label>
              <Select
                value={formData.wasOverloaded}
                onChange={(e) => setFormData({ ...formData, wasOverloaded: e.target.value })}
                options={[
                  { value: '', label: 'Select your answer' },
                  { value: 'no', label: 'No, it felt manageable' },
                  { value: 'slight', label: 'Slightly overloaded' },
                  { value: 'yes', label: 'Yes, definitely overloaded' }
                ]}
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label required">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6.66667 10.8333L9.16667 13.3333L18.3333 4.16667M17.5 10V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                How accurate was today's schedule?
              </label>
              <Select
                value={formData.scheduleAccuracy}
                onChange={(e) => setFormData({ ...formData, scheduleAccuracy: e.target.value })}
                options={[
                  { value: '', label: 'Select your answer' },
                  { value: 'very', label: 'Very accurate - worked perfectly' },
                  { value: 'mostly', label: 'Mostly accurate - minor adjustments' },
                  { value: 'somewhat', label: 'Somewhat accurate - several changes' },
                  { value: 'not', label: 'Not accurate - didn\'t follow it' }
                ]}
                required
              />
            </div>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Reflection'}
            </Button>
          </form>
        </div>
      ) : (
        <div className="reflection-complete-card">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21.3333 32L28 38.6667L42.6667 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Today's Reflection Complete</h3>
          <p>You've already completed today's reflection. Come back tomorrow!</p>
        </div>
      )}

      <div className="past-reflections-section">
        <h3 className="section-title">Past Reflections ({reflections.length})</h3>
        {reflections.length > 0 ? (
          <div className="reflections-grid">
            {reflections.slice(0, 10).map(reflection => (
              <ReflectionCard key={reflection._id} reflection={reflection} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 6.66667V11.7333M32 52.2667V57.3333M57.3333 32H52.2667M11.7333 32H6.66667M49.0667 49.0667L45.3333 45.3333M49.0667 14.9333L45.3333 18.6667M14.9333 49.0667L18.6667 45.3333M14.9333 14.9333L18.6667 18.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="empty-title">No reflections yet</h3>
            <p className="empty-description">Complete your first reflection to start tracking your progress</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReflectionCard = ({ reflection }) => {
  const [expanded, setExpanded] = useState(false);

  const getOverloadColor = (level) => {
    const colors = {
      no: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' },
      slight: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' },
      yes: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }
    };
    return colors[level] || colors.no;
  };

  const overloadStyle = getOverloadColor(reflection.wasOverloaded);

  return (
    <div className="reflection-card">
      <div className="reflection-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="reflection-date">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.6667 3.33333H3.33333C2.41286 3.33333 1.66667 4.07952 1.66667 5V16.6667C1.66667 17.5871 2.41286 18.3333 3.33333 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V5C18.3333 4.07952 17.5871 3.33333 16.6667 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.3333 1.66667V5M6.66667 1.66667V5M1.66667 8.33333H18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {new Date(reflection.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="reflection-badges">
          <span
            className="overload-badge"
            style={{ background: overloadStyle.bg, color: overloadStyle.color }}
          >
            {reflection.wasOverloaded === 'no' ? 'Manageable' :
             reflection.wasOverloaded === 'slight' ? 'Slight overload' :
             'Overloaded'}
          </span>
          <span className="accuracy-badge">
            Schedule: {reflection.scheduleAccuracy}
          </span>
        </div>
        <button className="expand-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d={expanded ? "M15 12.5L10 7.5L5 12.5" : "M5 7.5L10 12.5L15 7.5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="reflection-card-content">
          {reflection.wentWell && (
            <div className="reflection-section">
              <h4>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.66667 11.6667C6.66667 11.6667 7.91667 13.3333 10 13.3333C12.0833 13.3333 13.3333 11.6667 13.3333 11.6667M7.5 7.5H7.50833M12.5 7.5H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                What went well
              </h4>
              <p>{reflection.wentWell}</p>
            </div>
          )}
          {reflection.feltHeavy && (
            <div className="reflection-section">
              <h4>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.66667 12.5C6.66667 12.5 7.91667 10.8333 10 10.8333C12.0833 10.8333 13.3333 12.5 13.3333 12.5M7.5 7.5H7.50833M12.5 7.5H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                What felt challenging
              </h4>
              <p>{reflection.feltHeavy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectionsPage;