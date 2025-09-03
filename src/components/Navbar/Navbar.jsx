import React from 'react';
import './Navbar.css';

const Navbar = ({ isDarkMode, setIsDarkMode, resetTest, testDuration, setShowAuthPopup }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img
          src={isDarkMode ? "/2.png" : "/1.png"}
          alt="Logo"
          className="nav-logo"
        />
      </div>
      <div className="nav-center">
        <span className="nav-item">Tracks</span>
        <button
          className="nav-item switch-realm"
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            resetTest(testDuration);
          }}
          aria-label="Toggle dark/light mode"
        >
          Switch Realm
        </button>
        <span className="nav-item">Control Den</span>
      </div>
      <div className="nav-right">
        <button
          className="join-club"
          onClick={() => setShowAuthPopup(true)}
        >
          Join the Club
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
