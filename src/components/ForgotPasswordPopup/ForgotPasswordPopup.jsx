import React, { useState } from 'react';
import './ForgotPasswordPopup.css';
import '../AuthPopup/AuthPopup.css'; // Reusing AuthPopup styles
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import PopIn from '../PopIn';

const ForgotPasswordPopup = ({ setShow, triggerInfoPopup, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const themeClass = isDarkMode ? 'dark' : 'light';

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setShow(false);
      triggerInfoPopup('Password reset link sent! Check your inbox.');
    } catch (err) {
      setError('No account found with this email.');
    }
  };

  return (
    <div className="forgot-password-overlay" onClick={() => setShow(false)}>
      <PopIn>
        <div className={`auth-popup ${themeClass}`} onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setShow(false)}>✕</button>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-info-text">Enter your email to receive a reset link.</p>
          <form onSubmit={handleResetPassword}>
            <div className="auth-fields">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="auth-input"
                required
              />
            </div>
            {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0 0' }}>{error}</p>}
            <button type="submit" className="auth-submit">Send Reset Link</button>
          </form>
        </div>
      </PopIn>
    </div>
  );
};

export default ForgotPasswordPopup;
