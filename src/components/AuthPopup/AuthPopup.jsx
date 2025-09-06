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

const AuthPopup = ({ setShowAuthPopup, isDarkMode, triggerInfoPopup }) => {
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLoginMode) {
      // --- LOGIN LOGIC ---
      try {
        await signInWithEmailAndPassword(auth, email, password);
        handleAuthSuccess();
      } catch (err) {
        // If user is not found, trigger the custom popup
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          setShowAuthPopup(false); // Close the auth popup
          triggerInfoPopup("Account not found. Please Sign Up first.");
        } else {
          setError(err.message);
        }
      }
    } else {
      // --- SIGNUP LOGIC ---
      if (username.trim() === "") {
        setError("Username cannot be empty.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Update profile in Firebase Auth
        await updateProfile(user, {
          displayName: username,
        });

        // Create a user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: user.email,
          createdAt: new Date(),
        });

        handleAuthSuccess();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // For social logins, also create a user doc in Firestore if it's their first time
      await setDoc(doc(db, "users", user.uid), {
        username: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      }, { merge: true }); // Use merge to not overwrite existing data

      handleAuthSuccess();
    } catch (err) {
      // --- UPDATED ERROR HANDLING FOR SOCIAL LOGINS ---
      if (err.code === 'auth/account-exists-with-different-credential') {
        setShowAuthPopup(false); // Close this popup
        // Trigger the info popup with a specific message
        triggerInfoPopup("An account with this email already exists. Please log in using the original method.");
      } else {
        // For all other errors, show them in the auth popup
        setError(err.message);
      }
    }
  };

  return (
    <div className={`auth-popup ${themeClass}`}>
      <button className="close-btn" onClick={() => setShowAuthPopup(false)}>
        ✕
      </button>

      <h2 className="auth-title">{isLoginMode ? "Login" : "Sign Up"}</h2>

      <form onSubmit={handleEmailSubmit}>
        <div className="auth-fields">
          {/* --- Conditionally render Username input for signup mode --- */}
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
