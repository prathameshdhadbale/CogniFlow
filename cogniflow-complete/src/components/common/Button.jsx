import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`.trim()}
      disabled={disabled}
      aria-busy={disabled}
      {...props}
    >
      {icon && <span className="btn-icon" aria-hidden>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;