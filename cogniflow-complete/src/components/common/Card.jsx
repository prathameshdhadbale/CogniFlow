import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ children, title, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      className={`card ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, boxShadow: 'var(--shadow-strong)' } : {}}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </motion.div>
  );
};

export default Card;
