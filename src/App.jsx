// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './pages/About';
import Contact from './pages/Contact';
import More from './pages/More';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Schedule from './pages/Schedule';
import InterviewSession from './pages/InterviewSession';
import ErrorMessage from './components/ErrorMessage';
import PrivateRoute from './components/PrivateRoute';

// Create a wrapper to use useLocation inside Router
function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/signup','/schedule', '/interview-session'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || location.pathname.includes('/interview-session/');

  return (
    <>
      <ScrollToTop />
      <ErrorMessage />
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/more" element={<More />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/schedule" element={
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        }/>
        <Route path="/interview-session/:interviewId" element={
          <PrivateRoute>
            <InterviewSession />
          </PrivateRoute>
        }/>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
