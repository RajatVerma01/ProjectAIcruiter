// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmailAndPassword, signInWithGoogle } from '../firebase';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import './Auth.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setError } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await registerWithEmailAndPassword(email, password);
      
      if (error) {
        setError(error);
        return;
      }
      
      // Successfully signed up
      console.log('Signed up user:', user);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        setError(error);
        return;
      }
      
      // Successfully logged in with Google
      console.log('Signed up with Google:', user);
    navigate('/');
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="auth-container">
      <div className="auth-box">
        <h2>Signup</h2>
        <form className="auth-form" onSubmit={handleSignup}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <button 
          className="google-sign-in-button" 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
          Sign up with Google
        </button>
        <p className="auth-toggle-text">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
    </PageTransition>
  );
}

export default Signup;
