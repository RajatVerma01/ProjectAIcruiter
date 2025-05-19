// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword, signInWithGoogle, resetPassword } from '../firebase';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { setError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await loginWithEmailAndPassword(email, password);
      
      if (error) {
        setError(error);
        return;
      }
      
      // Successfully logged in
      console.log('Logged in user:', user);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please try again.');
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
      console.log('Logged in with Google:', user);
    navigate('/');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error);
        return;
      }
      
      setResetSent(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        {resetSent ? (
          <div className="reset-success">
            <p>Password reset email sent! Check your inbox.</p>
            <button 
              onClick={() => setResetSent(false)} 
              className="reset-back-button"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
        <form className="auth-form" onSubmit={handleLogin}>
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
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
        </form>
            <p className="forgot-password">
              <a href="#" onClick={handlePasswordReset}>Forgot Password?</a>
            </p>
            <div className="auth-divider">or</div>
            <button 
              className="google-sign-in-button" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
              Sign in with Google
            </button>
        <p className="auth-toggle-text">
              Don't have an account? <Link to="/signup">Signup here</Link>
        </p>
          </>
        )}
        </div>
      </div>
    </PageTransition>
  );
}

export default Login;
