import React from 'react';
import { FaRedo } from 'react-icons/fa';
import './ResetButton.css';

const ResetButton = ({ resetTest }) => {
  return (
    <div>
      <button
        className="reset-button"
        onClick={resetTest}
        aria-label="Reset typing test"
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default ResetButton;
