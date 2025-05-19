import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ErrorMessage.css';

const ErrorMessage = () => {
  const { error, setError } = useAuth();

  if (!error) return null;

  return (
    <div className="error-message">
      <span>{error}</span>
      <button onClick={() => setError('')} className="error-close">×</button>
    </div>
  );
};

export default ErrorMessage; 