import React, { useId } from 'react';
import './Input.css';

const Input = ({ label, error, helperText, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId.replace(/:/g, '')}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {error && <span id={errorId} className="input-error-text" role="alert">{error}</span>}
      {helperText && !error && <span id={helperId} className="input-helper-text">{helperText}</span>}
    </div>
  );
};

export const TextArea = ({ label, error, helperText, className = '', id, ...props }) => {
  const generatedId = useId();
  const fieldId = id || `textarea-${generatedId.replace(/:/g, '')}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText && !error ? `${fieldId}-helper` : undefined;
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label" htmlFor={fieldId}>{label}</label>}
      <textarea
        id={fieldId}
        className={`input-field textarea ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {error && <span id={errorId} className="input-error-text" role="alert">{error}</span>}
      {helperText && !error && <span id={helperId} className="input-helper-text">{helperText}</span>}
    </div>
  );
};

export const Select = ({ label, options, error, helperText, className = '', id, ...props }) => {
  const generatedId = useId();
  const selectId = id || `select-${generatedId.replace(/:/g, '')}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText && !error ? `${selectId}-helper` : undefined;
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label" htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        className={`input-field select ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span id={errorId} className="input-error-text" role="alert">{error}</span>}
      {helperText && !error && <span id={helperId} className="input-helper-text">{helperText}</span>}
    </div>
  );
};

export default Input;