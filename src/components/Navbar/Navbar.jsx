import React, { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleMenuItemClick = (callback) => {
    if (callback) callback();
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isMenuOpen ? "menu-open" : ""}`}>
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

      {/* Desktop Navigation (visible only above 1024px) */}
      <div className="nav-center desktop-nav">
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

      <div className="nav-right desktop-nav">
        {currentUser ? (
          <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
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

      {/* Mobile/Tablet Hamburger + Drawer (visible up to 1024px) */}
      <button
        className={`hamburger-btn mobile-only ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <button
          className="mobile-nav-item"
          onClick={() => handleMenuItemClick(showTracks)}
          disabled={!showTracks}
        >
          Tracks
        </button>
        <button
          className="mobile-nav-item"
          onClick={() =>
            handleMenuItemClick(() => {
              setIsDarkMode(!isDarkMode);
              resetTest();
            })
          }
        >
          Switch Realm
        </button>
        <button
          className="mobile-nav-item"
          onClick={() => handleMenuItemClick(showControlDen)}
          disabled={!showControlDen}
        >
          Control Den
        </button>

        <div className="mobile-divider"></div>

        {currentUser ? (
          <>
            <div className="mobile-user-info">
              <span>Hi, {currentUser.displayName || currentUser.email}</span>
            </div>
            <button className="mobile-nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            className="mobile-nav-item join-btn"
            onClick={() => handleMenuItemClick(() => setShowAuthPopup(true))}
          >
            Join the Club
          </button>
        )}
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;
