import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import MetricsBox from "./components/MetricsBox/MetricsBox";
import TypingArea from "./components/TypingArea/TypingArea";
import ResultsPopup from "./components/ResultsPopup/ResultsPopup";
import AuthPopup from "./components/AuthPopup/AuthPopup";
import ResetButton from "./components/ResetButton/ResetButton";
import Tracks from "./components/Tracks/Tracks";
import ControlDen from "./components/ControlDen/ControlDen";
import InfoPopup from "./components/InfoPopup.jsx";
import ForgotPasswordPopup from "./components/ForgotPasswordPopup/ForgotPasswordPopup.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

// Helper: fetch local 1-1000.txt and parse lines to array
async function fetchLocalWordList() {
  const res = await fetch("/1-1000.txt");
  if (!res.ok) throw new Error("Failed to fetch word list");
  const text = await res.text();
  return text
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}

// Random helper: pick N random words from array
function pickRandomWords(pool, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const w = pool[Math.floor(Math.random() * pool.length)];
    result.push(w);
  }
  return result;
}

export default function App() {
  const { currentUser } = useAuth();

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [infoPopupMessage, setInfoPopupMessage] = useState("");

  const [testDuration, setTestDuration] = useState(30);

  // Word list loaded once from 1-1000.txt
  const [wordPool, setWordPool] = useState([]);

  // Words used in current test
  const [words, setWords] = useState([]);               
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [charResults, setCharResults] = useState([]);   

  const [timeLeft, setTimeLeft] = useState(testDuration);
  const [isActive, setIsActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [metricsBoxFlipped, setMetricsBoxFlipped] = useState(false);
  const [liquidActive, setLiquidActive] = useState(false);

  const [showResults, setShowResults] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [historyWPM, setHistoryWPM] = useState([]);
  const [highestWPM, setHighestWPM] = useState(0);
  const [lowestWPM, setLowestWPM] = useState(Infinity);
  const [rawWPM, setRawWPM] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const [tracks, setTracks] = useState([]);
  const [page, setPage] = useState("home");

  const [userStats, setUserStats] = useState({
    totalTests: 0,
    totalTime: 0,
    estimatedWords: 0,
    estimatedErrors: 0,
    highestWpm: 0,
    highestRaw: 0,
    totalAccuracy: 0,
  });

  const containerRef = useRef(null);
  const typingBoxRef = useRef(null);

  const INITIAL_COUNT = 40;
  const TOP_UP_COUNT = 20;

  // Seed words from local pool
  const seedWords = useCallback(() => {
    if (wordPool.length === 0) return; // wait until loaded
    const initialWords = pickRandomWords(wordPool, INITIAL_COUNT);
    setWords(initialWords);
    setCharResults(initialWords.map(() => []));
  }, [wordPool]);

  // Append more words on demand
  const topUpWords = useCallback(() => {
    if (wordPool.length === 0) return;
    const additionalWords = pickRandomWords(wordPool, TOP_UP_COUNT);
    setWords((prevWords) => {
      setCharResults((prevCharResults) => [...prevCharResults, ...additionalWords.map(() => [])]);
      return [...prevWords, ...additionalWords];
    });
  }, [wordPool]);

  // Reset handling
  const resetTest = useCallback((newDuration = testDuration) => {
    setTestDuration(newDuration);
    setTimeLeft(newDuration);
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
    if (typingBoxRef.current) typingBoxRef.current.scrollTop = 0;
    if (containerRef.current) containerRef.current.focus();
    seedWords();
  }, [seedWords, testDuration]);

  // Load word pool once on mount
  useEffect(() => {
    fetchLocalWordList()
      .then(wordsList => {
        setWordPool(wordsList);
      })
      .catch(err => {
        console.error("Failed to load word pool file", err);
      });
  }, []);

  // Seed when word pool available or reset called
  useEffect(() => { seedWords(); }, [seedWords]);

  /* ================= TIMER/WPM ================= */
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          const newTimeLeft = t - 1;
          const typedCharsCount = getTypedCharsCount();
          const correctCharsCount = getCorrectCharsCount();
          const elapsed = testDuration - newTimeLeft;
          const elapsedMin = elapsed / 60;
          const currentRaw = elapsedMin > 0 ? typedCharsCount / 5 / elapsedMin : 0;
          const currentNet = elapsedMin > 0 ? correctCharsCount / 5 / elapsedMin : 0;

          setRawWPM((prev) => Math.max(prev, currentRaw));
          setHighestWPM((prev) => Math.max(prev, currentNet));
          setLowestWPM((prev) => Math.min(prev, currentNet));
          setErrorCount(typedCharsCount - correctCharsCount);
          setHistoryWPM((prev) => [...prev, currentNet]);

          return newTimeLeft;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, testDuration]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false);

      const typedCharsCount = getTypedCharsCount();
      const correctCharsCount = getCorrectCharsCount();
      const elapsedMin = testDuration / 60;

      const finalWpm = elapsedMin > 0 ? (correctCharsCount / 5) / elapsedMin : 0;
      const finalRawWpm = elapsedMin > 0 ? (typedCharsCount / 5) / elapsedMin : 0;
      const finalAccuracy = typedCharsCount > 0 ? (correctCharsCount / typedCharsCount) * 100 : 0;
      const finalErrorCount = typedCharsCount - correctCharsCount;

      const finalHighestWpm = Math.max(highestWPM, finalWpm);
      const assuredRawWpm = Math.max(rawWPM, finalRawWpm, finalHighestWpm);

      setRawWPM(assuredRawWpm);
      setHighestWPM(finalHighestWpm);
      setErrorCount(finalErrorCount);

      setShowResults(true);

      const newTrack = {
        wpm: parseFloat(finalWpm.toFixed(2)),
        accuracy: parseFloat(finalAccuracy.toFixed(2)),
        errors: finalErrorCount,
        rawWpm: parseFloat(assuredRawWpm.toFixed(2)),
        highestWpm: parseFloat(finalHighestWpm.toFixed(2)),
        lowestWpm: isFinite(lowestWPM) ? parseFloat(lowestWPM.toFixed(2)) : 0,
        testDuration,
        createdAt: serverTimestamp(),
      };

      if (currentUser) {
        const saveTrackAndUpdateStats = async () => {
          try {
            await addDoc(collection(db, "tests"), { ...newTrack, userId: currentUser.uid });
            const statsRef = doc(db, "userStats", currentUser.uid);
            const newStats = {
              totalTests: (userStats.totalTests || 0) + 1,
              totalTime: (userStats.totalTime || 0) + testDuration,
              estimatedWords: (userStats.estimatedWords || 0) + (correctCharsCount / 5),
              estimatedErrors: (userStats.estimatedErrors || 0) + finalErrorCount,
              highestWpm: Math.max(userStats.highestWpm || 0, newTrack.highestWpm),
              highestRaw: Math.max(userStats.highestRaw || 0, newTrack.rawWpm),
              totalAccuracy: (userStats.totalAccuracy || 0) + finalAccuracy,
            };
            await setDoc(statsRef, newStats, { merge: true });
            setUserStats(newStats);
          } catch (error) {
            console.error("Error saving track and stats: ", error);
          }
        };
        saveTrackAndUpdateStats();
      }

      setTracks((prev) => [
        { ...newTrack, id: Date.now(), dateTimeDisplay: new Date().toLocaleString("en-IN") },
        ...prev
      ]);
    }
  }, [timeLeft, isActive, currentUser, testDuration, highestWPM, lowestWPM, rawWPM, userStats]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setTracks([]);
        setUserStats({ totalTests: 0, totalTime: 0, estimatedWords: 0, estimatedErrors: 0, highestWpm: 0, highestRaw: 0, totalAccuracy: 0 });
        return;
      }

      const q = query(collection(db, "tests"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const userTracks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dateTimeDisplay: doc.data().createdAt?.toDate().toLocaleString("en-IN") || 'N/A'
      }));
      setTracks(userTracks);

      const statsRef = doc(db, "userStats", currentUser.uid);
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) setUserStats(statsSnap.data());
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (isActive) {
      setMetricsBoxFlipped(true);
      setLiquidActive(true);
    } else if (timeLeft === 0) {
      setMetricsBoxFlipped(false);
      setLiquidActive(false);
    }
  }, [isActive, timeLeft]);

  // On line change, scroll and top up words
  useEffect(() => {
    if (typingBoxRef.current && currentWordIndex > 0) {
      const currentWordEl = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
      const prevWordEl = document.querySelector(`[data-word-index="${currentWordIndex - 1}"]`);
      if (currentWordEl && prevWordEl && currentWordEl.offsetTop > prevWordEl.offsetTop) {
        typingBoxRef.current.scrollTop = currentWordEl.offsetTop;
        topUpWords();
      }
    }
  }, [currentWordIndex, topUpWords]);

  useEffect(() => {
    function handleShiftEnter(e) {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        resetTest(testDuration);
      }
    }
    window.addEventListener("keydown", handleShiftEnter);
    return () => window.removeEventListener("keydown", handleShiftEnter);
  }, [testDuration, resetTest]);

  const getTypedCharsCount = () => {
    let count = 0;
    for (let i = 0; i < currentWordIndex; i++) {
      count += (words[i]?.length || 0) + 1;
    }
    count += currentInput.length;
    return count;
  };

  const getCorrectCharsCount = () => {
    let correct = 0;
    for (let i = 0; i < currentWordIndex; i++) {
      correct += (charResults[i] || []).filter(Boolean).length;
    }
    const currentWord = words[currentWordIndex] || "";
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === currentWord[i]) correct++;
    }
    return correct;
  };

  function handleKeyDown(e) {
    if (timeLeft === 0) return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.key === "Enter") return;
    if (document.activeElement !== containerRef.current) containerRef.current.focus();
    if (!isActive) setIsActive(true);
    const currentWord = words[currentWordIndex] || "";
    if (e.key === "Backspace") {
      e.preventDefault();
      if (currentInput.length > 0) setCurrentInput(currentInput.slice(0, -1));
      else if (currentWordIndex > 0) setCurrentWordIndex(currentWordIndex - 1);
      return;
    }
    if (e.key === " ") {
      e.preventDefault();
      if (currentInput === "") return;
      const expectedWithSpace = currentWord + " ";
      const results = expectedWithSpace.split("").map((char, i) => i < currentInput.length ? currentInput[i] === char : false);
      if (currentInput.length >= currentWord.length) results[currentWord.length] = true;
      setCharResults((cr) => {
        const newCr = [...cr];
        newCr[currentWordIndex] = results;
        return newCr;
      });
      setCurrentWordIndex((i) => i + 1);
      setCurrentInput("");
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      if (currentInput.length < currentWord.length) setCurrentInput((c) => c + e.key.toLowerCase());
    }
  }

  const typedCharsCountLive = getTypedCharsCount();
  const correctCharsLive = getCorrectCharsCount();
  const elapsedMinLive = (testDuration - timeLeft) / 60;
  const wpmLive = elapsedMinLive > 0 ? correctCharsLive / 5 / elapsedMinLive : 0;
  const accuracyLive = typedCharsCountLive > 0 ? (correctCharsLive / typedCharsCountLive) * 100 : 0;

  const handleShowTracks = () => setPage("tracks");
  const handleGoHome = () => setPage("home");
  const handleCloseTracks = () => setPage("home");
  const handleClearTracks = () => setTracks([]);
  const handleShowControlDen = () => setPage("controlDen");
  const triggerInfoPopup = (message) => { setInfoPopupMessage(message); setShowInfoPopup(true); };

  return (
    <>
      {page === "home" && (
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
            showTracks={handleShowTracks}
            showControlDen={handleShowControlDen}
            goHome={handleGoHome}
          />
          <MetricsBox
            metricsBoxFlipped={metricsBoxFlipped}
            liquidActive={liquidActive}
            testDuration={testDuration}
            resetTest={resetTest}
            wpm={wpmLive}
            accuracy={accuracyLive}
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
              wpm={wpmLive}
              accuracy={accuracyLive}
              rawWPM={rawWPM}
              highestWPM={highestWPM}
              lowestWPM={lowestWPM}
              errorCount={errorCount}
            />
          )}
          <ResetButton resetTest={() => resetTest(testDuration)} />
        </div>
      )}

      {page === "tracks" && (
        <div className={isDarkMode ? "app-wrapper dark" : "app-wrapper light"}>
          <Navbar
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            resetTest={resetTest}
            setShowAuthPopup={setShowAuthPopup}
            showTracks={handleShowTracks}
            showControlDen={handleShowControlDen}
            goHome={handleGoHome}
          />
          <Tracks
            tracks={tracks}
            onCloseTracks={handleCloseTracks}
            onClearAll={handleClearTracks}
          />
        </div>
      )}

      {page === "controlDen" && (
        <div className={isDarkMode ? "app-wrapper dark" : "app-wrapper light"}>
          <Navbar
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            resetTest={resetTest}
            setShowAuthPopup={setShowAuthPopup}
            showTracks={handleShowTracks}
            showControlDen={handleShowControlDen}
            goHome={handleGoHome}
          />
          <ControlDen isDarkMode={isDarkMode} userStats={userStats} />
        </div>
      )}

      {showAuthPopup && (
        <AuthPopup
          setShowAuthPopup={setShowAuthPopup}
          isDarkMode={isDarkMode}
          triggerInfoPopup={triggerInfoPopup}
          setShowForgotPassword={setShowForgotPassword}
        />
      )}
      {showForgotPassword && (
        <ForgotPasswordPopup
          setShow={setShowForgotPassword}
          triggerInfoPopup={triggerInfoPopup}
          isDarkMode={isDarkMode}
        />
      )}
      {showInfoPopup && (
        <InfoPopup
          message={infoPopupMessage}
          onClose={() => setShowInfoPopup(false)}
          isDarkMode={isDarkMode}
        />
      )}
      <div className="bg-blur"></div>
    </>
  );
}
