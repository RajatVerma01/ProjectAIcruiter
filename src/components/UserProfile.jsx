// src/components/UserProfile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase';
import './UserProfile.css';

const UserProfile = () => {
  const { currentUser, setError } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await logoutUser();
      if (error) {
        setError(error);
        return;
      }
      navigate('/login');
    } catch (err) {
      setError('Failed to log out. Please try again.');
      console.error(err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        <img 
          src={currentUser.photoURL || 'https://via.placeholder.com/40'} 
          alt="Profile" 
          className="user-avatar" 
        />
        <span className="user-email">{currentUser.email}</span>
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default UserProfile;
 