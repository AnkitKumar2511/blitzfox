import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import './ResultsPopup.css';

const ResultsPopup = ({
  setShowResults,
  resetTest,
  testDuration,
  historyWPM,
  wpm,
  accuracy,
  rawWPM,
  highestWPM,
  lowestWPM,
  errorCount
}) => {
  return (
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
  );
};

export default ResultsPopup;
