
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';  // Import the Navbar component
import About from './pages/About';
import Contact from './pages/Contact';
import More from './pages/More';
import Home from './pages/Home'; 
import ScrollToTop from './components/ScrollToTop'; /// Assuming you have a Home component
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <>
            <Router>
              <ScrollToTop />
                <Navbar /> {/* Render the Navbar on all pages */}
                <div style={{ }}> {/* Add margin to prevent content from being hidden under the navbar */}
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/more" element={<More />} />
                </Routes>
              </div>
      
              
            </Router>
    </>
    

  );
}

export default App;
