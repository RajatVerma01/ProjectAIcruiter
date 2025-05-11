// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook for redirection

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with', email, password);

    // Simulate successful login
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        <p className="auth-toggle-text">
          Don’t have an account? <Link to="/signup">Signup here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
