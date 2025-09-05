import React, { useState } from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import './AuthPopup.css';

const AuthPopup = ({ setShowAuthPopup, isDarkMode }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Apply 'dark' or 'light' class based on the prop
  const themeClass = isDarkMode ? 'dark' : 'light';

  return (
    <div className={`auth-popup ${themeClass}`}>
      <button
        className="close-btn"
        onClick={() => setShowAuthPopup(false)}
      >
        ✕
      </button>

      <h2 className="auth-title">{isLoginMode ? "Login" : "Sign Up"}</h2>

      <div className="auth-fields">
        <input type="text" placeholder="User ID" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />
      </div>

      <button className="auth-submit">
        {isLoginMode ? "Login" : "Sign Up"}
      </button>

      <div className="auth-social">
        <button className="social-btn google">
          <FaGoogle className="social-icon" />
        </button>
        <button className="social-btn github">
          <FaGithub className="social-icon" />
        </button>
      </div>

      <div className="auth-toggle">
        {isLoginMode ? (
          <span>
            Don't have an account?{" "}
            <button onClick={() => setIsLoginMode(false)}>Sign Up</button>
          </span>
        ) : (
          <span>
            Have an account?{" "}
            <button onClick={() => setIsLoginMode(true)}>Login</button>
          </span>
        )}
      </div>
    </div>
  );
};

export default AuthPopup;
