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
