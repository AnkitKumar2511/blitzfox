import React from 'react';
import './TypingArea.css';

const TypingArea = ({
  typingBoxRef,
  words,
  currentWordIndex,
  currentInput,
  charResults,
  timeLeft,
  isActive // UPDATED: Receive isActive prop
}) => {
  return (
    <div className="typing-area-box" ref={typingBoxRef}>
      <div className="typing-area" aria-label="Typing words">
        {words.map((word, i) => {
          const expectedChars = (word + ' ').split("");
          const pastWordResults = charResults[i] || [];
          const isCurrentWord = i === currentWordIndex;

          return (
            <span
              key={i}
              data-word-index={i}
              className="typing-word"
              aria-current={isCurrentWord ? "true" : "false"}
            >
              {expectedChars.map((char, idx) => {
                let colorClass = "char-default";
                if (i < currentWordIndex) {
                  if (pastWordResults[idx] === true) {
                    colorClass = "char-correct";
                  } else if (pastWordResults[idx] === false) {
                    colorClass = "char-incorrect";
                  }
                } else if (isCurrentWord) {
                  if (idx < currentInput.length) {
                    colorClass = currentInput[idx] === char ? "char-correct" : "char-incorrect";
                  }
                }
                return <span key={idx} className={`typing-char ${colorClass}`}>{char}</span>;
              })}
              
              {isCurrentWord && timeLeft > 0 && (
                <span 
                  // UPDATED: Add 'blinking' class only when test is not active
                  className={`cursor ${!isActive ? 'blinking' : ''}`} 
                  style={{ left: `calc(${currentInput.length}ch)` }} 
                />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TypingArea;
