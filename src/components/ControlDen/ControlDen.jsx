import React, { useState, useRef, useEffect } from "react";
import "./ControlDen.css";

export default function ControlDen({ isDarkMode, tracks }) {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState("/default-user-logo.png");
  const [username, setUsername] = useState("Ankit Kumar Gupta");
  const [editing, setEditing] = useState(false);

  // Compute stats
  const totalTests = tracks.length;
  const totalTimeSpent = tracks.reduce((sum, t) => sum + (t.testDuration || 0), 0);
  const testsStartedNotCompleted = tracks.filter(t => t.inProgress).length;

  // Handle image upload
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle username edit toggle and change
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    if (val.length <= 24) {
      setUsername(val);
    }
  };

  const handleEditToggle = () => {
    setEditing(prev => !prev);
  };

  // Accessibility: focus input when editing starts
  const usernameInputRef = useRef(null);
  useEffect(() => {
    if (editing && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [editing]);

  return (
    <div className={isDarkMode ? "control-den-page dark" : "control-den-page light"}>
      <div className="profile-section">
        <div className="profile-image-wrapper" onClick={handleImageClick} role="button" tabIndex={0} aria-label="Edit profile image" onKeyDown={(e) => { if (e.key === 'Enter') handleImageClick(); }}>
          <img src={profileImage} alt="User logo" className="profile-image" />
          <div className="edit-overlay">Edit</div>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <div className="username-section">
          {editing ? (
            <input
              type="text"
              ref={usernameInputRef}
              value={username}
              onChange={handleUsernameChange}
              maxLength={24}
              aria-label="Edit username"
              onBlur={handleEditToggle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEditToggle();
                }
              }}
            />
          ) : (
            <div
              className="username-display"
              onClick={handleEditToggle}
              role="button"
              tabIndex={0}
              aria-label="Edit username"
              onKeyDown={(e) => { if (e.key === 'Enter') handleEditToggle(); }}
            >
              {username}
            </div>
          )}
        </div>
      </div>

      <div className="stats-section" aria-live="polite">
        <div className="stat-item">
          <h3>Total no of tests done</h3>
          <p>{totalTests}</p>
        </div>
        <div className="stat-item">
          <h3>Total time spent (s)</h3>
          <p>{totalTimeSpent}</p>
        </div>
        <div className="stat-item">
          <h3>Tests started (not completed)</h3>
          <p>{testsStartedNotCompleted}</p>
        </div>
      </div>
    </div>
  );
}
