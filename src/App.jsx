import React, { useState, useEffect, useRef } from "react";
import './App.css';
import { FaClock, FaTachometerAlt, FaBullseye, FaRedo } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const WORDS_POOL = [
  "apple", "orange", "banana", "grape", "lemon", "mango",
  "peach", "pear", "plum", "berry", "melon", "cherry",
  "fruit", "juice", "sweet", "fresh", "ripe", "seed", "tree",
  "garden", "flower", "green", "plant", "leaf", "root", "bloom", "vine"
];

const generateWordsArray = (num = 30) =>
  Array(num).fill(0).map(() => WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);

const TIME_OPTIONS = [15, 30, 60, 120];

export default function App() {
  const [testDuration, setTestDuration] = useState(30);
  const [words, setWords] = useState(generateWordsArray());
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [charResults, setCharResults] = useState(
    Array(30).fill(null).map(() => [])
  );
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [isActive, setIsActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [metricsBoxFlipped, setMetricsBoxFlipped] = useState(false);
  const [liquidActive, setLiquidActive] = useState(false);

  const [showResults, setShowResults] = useState(false);
  const [historyWPM, setHistoryWPM] = useState([]);
  const [highestWPM, setHighestWPM] = useState(0);
  const [lowestWPM, setLowestWPM] = useState(Infinity);
  const [rawWPM, setRawWPM] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const containerRef = useRef(null);
  const typingBoxRef = useRef(null);

  const resetTest = (newDuration = testDuration) => {
    const initialWords = generateWordsArray();
    setTestDuration(newDuration);
    setTimeLeft(newDuration);
    setWords(initialWords);
    setCharResults(Array(initialWords.length).fill(null).map(() => []));
    setCurrentInput("");
    setCurrentWordIndex(0);
    setIsActive(false);

    setMetricsBoxFlipped(false);
    setLiquidActive(false);
    setShowResults(false);
    setHistoryWPM([]);
    setHighestWPM(0);
    setLowestWPM(Infinity);
    setRawWPM(0);
    setErrorCount(0);

    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Timer and live metrics
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);

        const typedCharsCount = getTypedCharsCount();
        const correctCharsCount = getCorrectCharsCount();
        const elapsed = testDuration - (timeLeft - 1);
        const elapsedMin = elapsed / 60;

        const raw = elapsedMin > 0 ? (typedCharsCount / 5) / elapsedMin : 0;
        const net = elapsedMin > 0 ? (correctCharsCount / 5) / elapsedMin : 0;
        const errors = typedCharsCount - correctCharsCount;

        setRawWPM(raw);
        setErrorCount(errors);

        setHistoryWPM(prev => [...prev, net]);
        setHighestWPM(prev => Math.max(prev, wpm));
        setLowestWPM(prev => Math.min(prev, net));
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowResults(true);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      setMetricsBoxFlipped(true);
      setLiquidActive(true);
    } else if (timeLeft === 0) {
      setMetricsBoxFlipped(false);
      setLiquidActive(false);
    }
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, [currentWordIndex, isActive]);

  // ✅ Scrolling effect
  useEffect(() => {
    const currentWordElement = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
    if (currentWordElement && typingBoxRef.current) {
      currentWordElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }
  }, [currentWordIndex]);

  useEffect(() => {
    function handleShiftEnter(e) {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        resetTest(testDuration);
      }
    }
    window.addEventListener("keydown", handleShiftEnter);
    return () => {
      window.removeEventListener("keydown", handleShiftEnter);
    };
  }, [testDuration]);

  const getTypedCharsCount = () => {
    let count = 0;
    for (let i = 0; i < words.length; i++) {
      if (i < currentWordIndex) count += words[i].length + 1;
      else if (i === currentWordIndex) count += currentInput.length;
    }
    return count;
  };

  const getCorrectCharsCount = () => {
    let correct = 0;
    for (let i = 0; i < words.length; i++) {
      const typedChars = i === currentWordIndex ? currentInput.split("") : [];
      const expectedChars = words[i].split("");
      const results = charResults[i] || [];
      const length = i === currentWordIndex ? typedChars.length : expectedChars.length;
      for (let j = 0; j < length; j++) {
        if (i === currentWordIndex) {
          if (typedChars[j] && typedChars[j] === expectedChars[j]) correct++;
        } else if (results[j]) correct++;
      }
    }
    return correct;
  };

  // ✅ Key handling with line generation
  function handleKeyDown(e) {
    if (timeLeft === 0) return;

    if (["Shift", "Control", "Alt", "Meta", "Enter"].includes(e.key)) {
      return;
    }

    if (!isActive) setIsActive(true);

    if (e.key === "Backspace") {
      e.preventDefault();
      if (currentInput.length > 0) setCurrentInput(currentInput.slice(0, -1));
      else if (currentWordIndex > 0) {
        setCurrentWordIndex(currentWordIndex - 1);
        setCurrentInput(words[currentWordIndex - 1]);
        setCharResults(cr => {
          const newCr = [...cr];
          newCr[currentWordIndex] = [];
          return newCr;
        });
      }
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      const expected = words[currentWordIndex];
      const typed = currentInput;
      const results = [];
      for (let i = 0; i < expected.length; i++) results.push(typed[i] === expected[i]);
      setCharResults(cr => {
        const newCr = [...cr];
        newCr[currentWordIndex] = results;
        return newCr;
      });

      setCurrentWordIndex(i => {
        const nextIndex = Math.min(i + 1, words.length - 1);
        const currentEl = document.querySelector(`[data-word-index="${i}"]`);
        const nextEl = document.querySelector(`[data-word-index="${i + 1}"]`);

        // ✅ Line-generation logic
        if (currentEl && nextEl && nextEl.offsetTop > currentEl.offsetTop) {
          const newLine = Array(10).fill(0).map(() => WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
          setWords(w => {
            const newWords = [...w, ...newLine];
            setCharResults(cr => [...cr, ...newLine.map(() => [])]);
            return newWords;
          });
        }

        return nextIndex;
      });

      setCurrentInput("");
      return;
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      setCurrentInput(c => c + e.key.toLowerCase());
    }
  }

  const typedCharsCount = getTypedCharsCount();
  const correctChars = getCorrectCharsCount();
  const elapsedMin = (testDuration - timeLeft) / 60;
  const wpm = elapsedMin > 0 ? (correctChars / 5) / elapsedMin : 0;
  const accuracy = typedCharsCount > 0 ? (correctChars / typedCharsCount) * 100 : null;

  return (
    <>
      <div className={isDarkMode ? "app-wrapper dark" : "app-wrapper light"}>
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-left">
            <img
              src={isDarkMode ? "/2.png" : "/1.png"}
              alt="Logo"
              className="nav-logo"
            />
          </div>
          <div className="nav-center">
            <span className="nav-item">Tracks</span>
            <button
              className="nav-item switch-realm"
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                resetTest(testDuration);
              }}
              aria-label="Toggle dark/light mode"
            >
              Switch Realm
            </button>
            <span className="nav-item">Control Den</span>
          </div>
          <div className="nav-right">
            <button className="join-club">Join the Club</button>
          </div>
        </nav>

        {/* Metrics box */}
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

        {/* Typing area */}
        <div className="typing-area-box" ref={typingBoxRef}>
          <div className="typing-area" aria-label="Typing words">
            {words.map((word, i) => {
              const expectedChars = word.split("");
              const typedChars = i === currentWordIndex ? currentInput.split("") : [];
              const charStatus = charResults[i] || [];

              return (
                <span
                  key={i}
                  data-word-index={i}
                  className="typing-word"
                  aria-current={i === currentWordIndex ? "true" : "false"}
                >
                  {expectedChars.map((char, idx) => {
                    let colorClass = "char-default";
                    if (i === currentWordIndex) {
                      if (typedChars[idx] == null) colorClass = "char-default";
                      else colorClass = typedChars[idx] === char ? "char-correct" : "char-incorrect";
                    } else if (i < currentWordIndex) {
                      colorClass = charStatus[idx] ? "char-correct" : "char-incorrect";
                    }
                    const showCursor = i === currentWordIndex && idx === typedChars.length && timeLeft > 0;

                    return (
                      <React.Fragment key={idx}>
                        {showCursor && (
                          <span className="cursor" style={{ left: `calc(${idx}ch)` }} />
                        )}
                        <span className={`typing-char ${colorClass}`}>{char}</span>
                      </React.Fragment>
                    );
                  })}
                  {i === currentWordIndex && typedChars.length === 0 && timeLeft > 0 && (
                    <span className="cursor" style={{ left: 0 }} />
                  )}
                  <span> </span>
                </span>
              );
            })}
          </div>
        </div>
        
        {showResults && (
          <div className="results-popup">
            <button
              className="close-btn"
              onClick={() => {
                setShowResults(false);
                resetTest(testDuration);
              }}
            >
              ✕
            </button>

            <h2 className="results-title">Test Results</h2>


          {/* Graph */}
            <div className="results-graph">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={historyWPM.map((val, i) => ({ time: i, wpm: val }))}
                  margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
                >
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "WPM", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="wpm" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Grid */}
            <div className="results-stats">
              <div>
                <strong>WPM</strong>
                <span>{wpm.toFixed(0)}</span>
              </div>
              <div>
                <strong>Accuracy</strong>
                <span>{accuracy.toFixed(0)}%</span>
              </div>
              <div>
                <strong>Raw WPM</strong>
                <span>{rawWPM.toFixed(0)}</span>
              </div>
              <div>
                <strong>Highest WPM</strong>
                <span>{highestWPM.toFixed(0)}</span>
              </div>
              <div>
                <strong>Lowest WPM</strong>
                <span>{lowestWPM.toFixed(0)}</span>
              </div>
              <div>
                <strong>Errors</strong>
                <span>{errorCount}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            className="reset-button"
            onClick={() => resetTest(testDuration)}
            aria-label="Reset typing test"
          >
            <FaRedo />
          </button>
        </div>
      </div>

      <div className="bg-blur"></div>
    </>
  );
}



