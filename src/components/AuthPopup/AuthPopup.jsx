import React, { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "./AuthPopup.css";
import { auth, db, googleProvider, githubProvider } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const AuthPopup = ({ setShowAuthPopup, isDarkMode, triggerInfoPopup, setShowForgotPassword }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const themeClass = isDarkMode ? "dark" : "light";

  const handleAuthSuccess = () => {
    setError("");
    setShowAuthPopup(false);
  };

  const handleAuthError = (err) => {
    let message = "An unexpected error occurred. Please try again.";
    switch (err.code) {
      case "auth/weak-password":
        message = "Password should be at least 6 characters.";
        break;
      case "auth/email-already-in-use":
        message = "This email is already registered. Please Login.";
        break;
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/user-not-found":
      case "auth/invalid-credential":
        message = "Account not found. Please Sign Up first.";
        break;
      case "auth/account-exists-with-different-credential":
        message = "An account with this email already exists. Please log in using the original method.";
        break;
      default:
        console.error("Firebase Auth Error:", err);
        break;
    }
    triggerInfoPopup(message);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLoginMode) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        handleAuthSuccess();
      } catch (err) {
        handleAuthError(err);
      }
    } else {
      if (username.trim() === "") {
        setError("Username cannot be empty."); 
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: user.email,
          createdAt: new Date(),
        });
        handleAuthSuccess();
      } catch (err) {
        handleAuthError(err);
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        username: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      }, { merge: true });
      handleAuthSuccess();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className={`auth-popup-overlay`}>
      <div className={`auth-popup ${themeClass}`}>
        <button className="close-btn" onClick={() => setShowAuthPopup(false)}>
          ✕
        </button>

        <h2 className="auth-title">{isLoginMode ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleEmailSubmit}>
          <div className="auth-fields">
            {!isLoginMode && (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Username"
                className="auth-input"
                required
              />
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="auth-input"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="auth-input"
              required
            />
          </div>

          {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

          <button type="submit" className="auth-submit">
            {isLoginMode ? "Login" : "Sign Up"}
          </button>
        </form>
        
        <div className="auth-social">
          <button
            className="social-btn google"
            onClick={() => handleSocialLogin(googleProvider)}
          >
            <FaGoogle className="social-icon" />
          </button>
          <button
            className="social-btn github"
            onClick={() => handleSocialLogin(githubProvider)}
          >
            <FaGithub className="social-icon" />
          </button>
        </div>

        {/* --- THIS IS THE FIX --- */}
        {/* Only show the "Forgot Password" button if in Login mode */}
        {isLoginMode && (
          <div className="forgot-password-container">
            <button onClick={handleForgotPasswordClick} className="forgot-password-button">
              Forgot Password?
            </button>
          </div>
        )}

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
    </div>
  );
};

export default AuthPopup;
