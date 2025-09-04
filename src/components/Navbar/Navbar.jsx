import React from 'react';
import './Navbar.css';

const Navbar = ({ isDarkMode, setIsDarkMode, resetTest, setShowAuthPopup, showTracks, goHome }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img
          src={isDarkMode ? "/2.png" : "./1.png"}
          alt="Logo"
          className="nav-logo"
          onClick={goHome}           // use goHome prop to switch to home page state
          style={{ cursor: 'pointer' }}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goHome(); }}
          role="button"
          aria-label="Go to home"
        />
      </div>
      <div className="nav-center">
        <button
          className="nav-item"
          type="button"
          onClick={showTracks}
          disabled={!showTracks}
          tabIndex={0}
        >
          Tracks
        </button>
        <button
          className="nav-item switch-realm"
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            resetTest();
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
