import React from 'react';
import './AuthPopup/AuthPopup.css'; // Reusing your existing CSS

const InfoPopup = ({ message, onClose, isDarkMode }) => {
  const themeClass = isDarkMode ? 'dark' : 'light';

  return (
    // We can reuse the main auth-popup class for styling
    <div className={`auth-popup ${themeClass}`}>
      <button className="close-btn" onClick={onClose}>
        ✕
      </button>

      <h2 className="auth-title">Notice</h2>
      
      <p style={{ textAlign: 'center', fontSize: '1rem', margin: '10px 0' }}>
        {message}
      </p>

      <button className="auth-submit" onClick={onClose}>
        Got it
      </button>
    </div>
  );
};

export default InfoPopup;
