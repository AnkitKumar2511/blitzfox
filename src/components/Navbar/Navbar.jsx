import React from "react";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { auth } from "../../firebase.js";
import { signOut } from "firebase/auth";

const Navbar = ({
  isDarkMode,
  setIsDarkMode,
  resetTest,
  setShowAuthPopup,
  showTracks,
  showControlDen,
  goHome,
}) => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img
          src={isDarkMode ? "/2.png" : "./1.png"}
          alt="Logo"
          className="nav-logo"
          onClick={goHome}
          style={{ cursor: "pointer" }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") goHome();
          }}
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
        <button
          className="nav-item"
          type="button"
          onClick={showControlDen}
          disabled={!showControlDen}
          tabIndex={0}
        >
          Control Den
        </button>
      </div>
      <div className="nav-right">
        {currentUser ? (
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Hi, {currentUser.displayName || currentUser.email}</span>
            <button className="join-club" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="join-club" onClick={() => setShowAuthPopup(true)}>
            Join the Club
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
