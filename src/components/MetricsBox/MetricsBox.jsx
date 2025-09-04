import React from 'react';
import { FaClock, FaTachometerAlt, FaBullseye } from 'react-icons/fa';
import './MetricsBox.css';

const TIME_OPTIONS = [15, 30, 60, 120];

const MetricsBox = ({
  metricsBoxFlipped,
  liquidActive,
  testDuration,
  containerRef,
  handleKeyDown,
  resetTest,
  wpm,
  accuracy
}) => {
  return (
    <div
      className={`metrics-box ${metricsBoxFlipped ? "flipped" : ""}`}
      aria-label="Typing test metrics"
    >
      <div
        className={`liquid-fill ${liquidActive ? "running" : ""}`}
        style={{ transitionDuration: liquidActive ? `${testDuration}s` : "0s" }}
      ></div>
      
      <div
        className="status-bar"
        tabIndex={0}
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        <div className="metric">
          <FaClock className="metric-icon" />
          <span>time:</span>
          <div className="time-selector">
            {TIME_OPTIONS.map(option => (
              <button
                key={option}
                className={`time-button ${testDuration === option ? 'selected' : ''}`}
                onClick={() => resetTest(option)}
                aria-label={`Set time to ${option} seconds`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <span className="metric-separator" aria-hidden="true" />

        <div className="metric">
          <FaTachometerAlt className="metric-icon" />
          <span>wpm:</span>
          <span className="metric-value">{wpm.toFixed(0)}</span>
        </div>

        <span className="metric-separator" aria-hidden="true" />

        <div className="metric">
          <FaBullseye className="metric-icon" />
          <span>accuracy:</span>
          <span className="metric-value">
            {accuracy === null ? "-" : `${accuracy.toFixed(0)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricsBox;