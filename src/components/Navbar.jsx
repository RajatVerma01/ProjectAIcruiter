import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useAuth();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">AIcruiter</Link>
      </div>

      {/* Hamburger is moved inside the menu container */}
      <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
          <Link to="/more" className="navbar-link">More</Link>
        </div>
        
        {currentUser ? (
          <UserProfile />
        ) : (
          <>
        <Link to="/login" className="navbar-button navbar-login">Login</Link>
        <Link to="/signup" className="navbar-button navbar-signup">Signup</Link>
          </>
        )}
      </div>

      {/* Right-aligned hamburger */}
      <div className="hamburger" onClick={toggleMenu}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
    </nav>
  );
}

export default Navbar;
