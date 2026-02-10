import React from 'react';
import { motion } from 'framer-motion';
import './FocusWindow.css';

const FocusWindow = ({ startTime, endTime, taskCount, reason }) => {
  return (
    <motion.div
      className="focus-window"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <h3>Peak Focus Window</h3>
      <div className="time-range">
        {startTime} - {endTime}
      </div>
      <p>
        {reason || 'Based on your patterns, this is your optimal time for deep work.'}
        {taskCount && ` Schedule shows ${taskCount} task${taskCount > 1 ? 's' : ''} during this window.`}
      </p>
    </motion.div>
  );
};

export default FocusWindow;
