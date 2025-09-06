import React, { useState, useRef, useEffect } from "react";
import "./ControlDen.css";
import PopIn from "../PopIn";
import { useAuth } from "../../context/AuthContext.jsx";
import { auth, db } from "../../firebase.js";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaEdit, FaSave } from "react-icons/fa";

export default function ControlDen({ isDarkMode, userStats }) {
  const { currentUser } = useAuth();
  
  const [editingField, setEditingField] = useState(null); 

  const [username, setUsername] = useState("Guest");
  const [joiningDate, setJoiningDate] = useState("N/A");
  const [keyboard, setKeyboard] = useState("");
  const [location, setLocation] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || currentUser.displayName);
          setKeyboard(data.keyboard || "");
          setLocation(data.location || "");
        } else {
          setUsername(currentUser.displayName);
        }
      });
      const creationDate = new Date(currentUser.metadata.creationTime);
      setJoiningDate(creationDate.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      }));
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const handleSave = async () => {
    if (!currentUser || !editingField) return;

    const fieldToSave = editingField;
    setEditingField(null);

    try {
      const dataToUpdate = { [fieldToSave]: eval(fieldToSave) };

      if (fieldToSave === 'username' && username !== currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: username });
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, dataToUpdate, { merge: true });

    } catch (error) {
      console.error(`Error updating ${fieldToSave}:`, error);
    }
  };

  // --- NEW: Calculate average stats for display ---
  const averageWpm = userStats.totalTests > 0 ? Math.round((userStats.estimatedWords / 5) / (userStats.totalTime / 60)) : 0;
  const averageAccuracy = userStats.totalTests > 0 ? Math.round(userStats.totalAccuracy / userStats.totalTests) : 0;

  return (
    <PopIn distance={20} duration={0.4}>
      <div className={isDarkMode ? "control-den-page dark" : "control-den-page light"}>

        <div className="user-details-section">
          <div className="username-container">
            {editingField === 'username' ? (
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="username-input-large"
                maxLength={24}
              />
            ) : (
              <h1 className="username-display-large">{username}</h1>
            )}
            {currentUser && (
              <button onClick={() => editingField === 'username' ? handleSave() : setEditingField('username')} className="edit-icon-button">
                {editingField === 'username' ? <FaSave /> : <FaEdit />}
              </button>
            )}
          </div>

          <div className="user-info-grid">
            <div className="info-field">
              <label>Joining Date</label>
              <div className="info-field-wrapper">
                <span>{joiningDate}</span>
              </div>
            </div>
            <div className="info-field">
              <label>Keyboard</label>
              <div className="info-field-wrapper">
                {editingField === 'keyboard' ? (
                  <input ref={inputRef} type="text" value={keyboard} onChange={(e) => setKeyboard(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder="e.g., Keychron K2" />
                ) : (
                  <span>{keyboard || "-"}</span>
                )}
                <button onClick={() => setEditingField('keyboard')} className="field-edit-icon" aria-label="Edit Keyboard">
                  <FaEdit />
                </button>
              </div>
            </div>
            <div className="info-field">
              <label>Location</label>
              <div className="info-field-wrapper">
                {editingField === 'location' ? (
                  <input ref={inputRef} type="text" value={location} onChange={(e) => setLocation(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder="e.g., Delhi, India" />
                ) : (
                  <span>{location || "-"}</span>
                )}
                <button onClick={() => setEditingField('location')} className="field-edit-icon" aria-label="Edit Location">
                    <FaEdit />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <h3>No of tests</h3>
            <p>{userStats.totalTests || 0}</p>
          </div>
          <div className="stat-item">
            <h3>Highest WPM</h3>
            <p>{Math.round(userStats.highestWpm) || 0}</p>
          </div>
          <div className="stat-item">
            <h3>Highest raw WPM</h3>
            <p>{Math.round(userStats.highestRaw) || 0}</p>
          </div>
          {/* --- NEW STATS BOXES --- */}
          <div className="stat-item">
            <h3>Average WPM</h3>
            <p>{averageWpm}</p>
          </div>
          <div className="stat-item">
            <h3>Average Accuracy</h3>
            <p>{averageAccuracy}%</p>
          </div>
          <div className="stat-item">
            <h3>Total typing time (s)</h3>
            <p>{userStats.totalTime || 0}</p>
          </div>
          <div className="stat-item">
            <h3>Words typed</h3>
            <p>{Math.round(userStats.estimatedWords) || 0}</p>
          </div>
          <div className="stat-item">
            <h3>Total errors</h3>
            <p>{userStats.estimatedErrors || 0}</p>
          </div>
        </div>

      </div>
    </PopIn>
  );
}
