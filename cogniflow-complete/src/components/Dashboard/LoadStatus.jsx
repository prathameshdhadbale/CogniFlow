import React from 'react';
import { motion } from 'framer-motion';
import './LoadStatus.css';

const LoadStatus = ({ status = 'optimal', taskCount, message }) => {
  const statusConfig = {
    light: {
      icon: '🌱',
      title: 'Light Cognitive Load',
      defaultMessage: 'You have breathing room today. Good time to tackle new challenges.',
      className: 'light'
    },
    optimal: {
      icon: '🧠',
      title: 'Optimal Cognitive Load',
      defaultMessage: "You're in a good flow state. Current schedule is balanced and manageable.",
      className: 'optimal'
    },
    heavy: {
      icon: '⚠️',
      title: 'Heavy Cognitive Load',
      defaultMessage: 'Consider postponing non-urgent tasks. Your capacity may be stretched.',
      className: 'heavy'
    }
  };

  const config = statusConfig[status] || statusConfig.optimal;

  return (
    <motion.div
      className={`load-status ${config.className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="load-icon">{config.icon}</div>
      <div className="load-content">
        <h3>{config.title}</h3>
        <p>{message || config.defaultMessage}</p>
        {taskCount !== undefined && (
          <p className="load-count">{taskCount} tasks scheduled today</p>
        )}
      </div>
    </motion.div>
  );
};

export default LoadStatus;
