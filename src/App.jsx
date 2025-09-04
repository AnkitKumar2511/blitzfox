import React, { useState, useEffect, useRef } from "react";
import './App.css';
import Navbar from "./components/Navbar/Navbar";
import MetricsBox from "./components/MetricsBox/MetricsBox";
import TypingArea from "./components/TypingArea/TypingArea";
import ResultsPopup from "./components/ResultsPopup/ResultsPopup";
import AuthPopup from "./components/AuthPopup/AuthPopup";
import ResetButton from "./components/ResetButton/ResetButton";
import Tracks from "./components/Tracks/Tracks";

const WORDS_POOL = [
  "apple", "orange", "banana", "grape", "lemon", "mango",
  "peach", "pear", "plum", "berry", "melon", "cherry",
  "fruit", "juice", "sweet", "fresh", "ripe", "seed", "tree",
  "garden", "flower", "green", "plant", "leaf", "root", "bloom", "vine"
];

const generateWordsArray = (num = 40) =>
  Array(num).fill(0).map(() => WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);

export default function App() {
  const [testDuration, setTestDuration] = useState(30);
  const [words, setWords] = useState(generateWordsArray());
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [charResults, setCharResults] = useState(
    Array(40).fill(null).map(() => [])
  );
  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [isActive, setIsActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [metricsBoxFlipped, setMetricsBoxFlipped] = useState(false);
  const [liquidActive, setLiquidActive] = useState(false);

  const [showResults, setShowResults] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const [historyWPM, setHistoryWPM] = useState([]);
  const [highestWPM, setHighestWPM] = useState(0);
  const [lowestWPM, setLowestWPM] = useState(Infinity);
  const [rawWPM, setRawWPM] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const [tracks, setTracks] = useState([]);
  const [page, setPage] = useState('home'); // 'home' or 'tracks'

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

    if(typingBoxRef.current) {
        typingBoxRef.current.scrollTop = 0;
    }

    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

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
        setHighestWPM(prev => Math.max(prev, net));
        setLowestWPM(prev => Math.min(prev, net));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, testDuration]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setShowResults(true);

      // Save test to history
      const typedCharsCount = getTypedCharsCount();
      const correctCharsCount = getCorrectCharsCount();
      const elapsed = testDuration;
      const elapsedMin = elapsed / 60;
      const wpm = elapsedMin > 0 ? (correctCharsCount / 5) / elapsedMin : 0;
      const accuracy = typedCharsCount > 0 ? (correctCharsCount / typedCharsCount) * 100 : 0;

      setTracks(prev => [
        ...prev,
        {
          id: Date.now(),
          dateTimeDisplay: new Date().toLocaleString('en-IN'),
          wpm,
          accuracy,
          errors: errorCount,
          rawWpm: rawWPM,
          highestWpm: highestWPM,
          lowestWpm: lowestWPM,
          testDuration,
        }
      ]);
    }
  }, [timeLeft, isActive]);

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
    if (typingBoxRef.current && currentWordIndex > 0) {
      const currentWordEl = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
      const prevWordEl = document.querySelector(`[data-word-index="${currentWordIndex - 1}"]`);
      
      if (currentWordEl && prevWordEl && currentWordEl.offsetTop > prevWordEl.offsetTop) {
        typingBoxRef.current.scrollTop = currentWordEl.offsetTop;

        const newLine = Array(20).fill(0).map(() => WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
        setWords(w => {
            const newWords = [...w, ...newLine];
            setCharResults(cr => [...cr, ...newLine.map(() => [])]);
            return newWords;
        });
      }
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
  }, [testDuration, resetTest]);

  const getTypedCharsCount = () => {
    let count = 0;
    for (let i = 0; i < currentWordIndex; i++) {
        count += words[i].length + 1;
    }
    count += currentInput.length;
    return count;
  };
  
  const getCorrectCharsCount = () => {
    let correct = 0;
    for (let i = 0; i < currentWordIndex; i++) {
        const resultForWordAndSpace = charResults[i] || [];
        correct += resultForWordAndSpace.filter(r => r === true).length;
    }
    const currentExpected = words[currentWordIndex] + ' ';
    for(let i = 0; i < currentInput.length; i++) {
        if(currentInput[i] === currentExpected[i]) {
            correct++;
        }
    }
    return correct;
  };  

  function handleKeyDown(e) {
    if (timeLeft === 0) return;

    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.key === "Enter") {
      return;
    }
    
    if (document.activeElement !== containerRef.current) {
        containerRef.current.focus();
    }

    if (!isActive) setIsActive(true);

    const currentWord = words[currentWordIndex];

    if (e.key === "Backspace") {
      e.preventDefault();
      if (currentInput.length > 0) {
        setCurrentInput(currentInput.slice(0, -1));
      } else if (currentWordIndex > 0) {
        setCurrentWordIndex(currentWordIndex - 1);
      }
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      
      if (currentInput === "") return;
      
      const expectedWithSpace = currentWord + ' ';
      const results = expectedWithSpace.split('').map((char, i) => {
        if (i < currentInput.length) {
            return currentInput[i] === char;
        }
        if (i === currentWord.length) {
            return currentInput.length === currentWord.length;
        }
        return false;
      });

      setCharResults(cr => {
        const newCr = [...cr];
        newCr[currentWordIndex] = results;
        return newCr;
      });

      setCurrentWordIndex(i => i + 1);
      setCurrentInput("");
      return;
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      if (currentInput.length < currentWord.length) {
        setCurrentInput(c => c + e.key.toLowerCase());
      }
    }
  }

  const typedCharsCount = getTypedCharsCount();
  const correctChars = getCorrectCharsCount();
  const elapsedMin = (testDuration - timeLeft) / 60;
  const wpm = elapsedMin > 0 ? (correctChars / 5) / elapsedMin : 0;
  const accuracy = typedCharsCount > 0 ? (correctChars / typedCharsCount) * 100 : 0;

  // Handlers for Tracks page navigation
  const handleShowTracks = () => setPage('tracks');
  const handleGoHome = () => setPage('home');
  const handleCloseTracks = () => setPage('home');
  const handleClearTracks = () => setTracks([]);

  return (
    <>
      {page === 'home' && (
        <div 
          className={isDarkMode ? "app-wrapper dark" : "app-wrapper light"} 
          onKeyDown={handleKeyDown} 
          tabIndex={0} 
          ref={containerRef}
        >
          <Navbar 
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            resetTest={resetTest}
            setShowAuthPopup={setShowAuthPopup}
            showTracks={handleShowTracks} // showTracks navigates to tracks page
            goHome={handleGoHome}          // goHome prop to navigate home on logo click
          />

          {showAuthPopup && <AuthPopup setShowAuthPopup={setShowAuthPopup} />}

          <MetricsBox
            metricsBoxFlipped={metricsBoxFlipped}
            liquidActive={liquidActive}
            testDuration={testDuration}
            resetTest={resetTest}
            wpm={wpm}
            accuracy={accuracy}
          />
          
          <TypingArea
            typingBoxRef={typingBoxRef}
            words={words}
            currentWordIndex={currentWordIndex}
            currentInput={currentInput}
            charResults={charResults}
            timeLeft={timeLeft}
            isActive={isActive}
          />

          {showResults && (
            <ResultsPopup
              setShowResults={setShowResults}
              resetTest={resetTest}
              testDuration={testDuration}
              historyWPM={historyWPM}
              wpm={wpm}
              accuracy={accuracy}
              rawWPM={rawWPM}
              highestWPM={highestWPM}
              lowestWPM={lowestWPM}
              errorCount={errorCount}
            />
          )}

          <ResetButton resetTest={() => resetTest(testDuration)} />
        </div>
      )}

      {page === 'tracks' && (
        <div className={isDarkMode ? "app-wrapper dark" : "app-wrapper light"}>
          <Navbar 
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            resetTest={resetTest}
            setShowAuthPopup={setShowAuthPopup}
            showTracks={null} // disable Tracks button here to avoid loops
            goHome={handleGoHome} // allow home navigation from tracks page logo click
          />
          <Tracks
            tracks={tracks}
            onCloseTracks={handleCloseTracks}
            onClearAll={handleClearTracks}
          />
        </div>
      )}

      <div className="bg-blur"></div>
    </>
  );
}
