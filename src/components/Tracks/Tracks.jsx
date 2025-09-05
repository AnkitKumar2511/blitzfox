import React from "react";
import "./Tracks.css";
import PopIn from "../PopIn"; // Import the PopIn component

export default function Tracks({ tracks, onCloseTracks, onClearAll }) {
  return (
    <PopIn distance={20} duration={0.4}>
      <div className="tracks-page">
        <div className="tracks-header">
          <h2>Tracks</h2>
          <div>
            <button className="back-btn" onClick={onCloseTracks}>Back</button>
          </div>
        </div>

        <div className="tracks-table-wrapper" role="region" aria-label="Tracks history">
          <table className="tracks-table">
            <thead>
              <tr>
                <th>Test No.</th>
                <th>Date and Time</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Errors</th>
                <th>RawWpm</th>
                <th>HighestWpm</th>
                <th>LowestWpm</th>
                <th>Time of test (s)</th>
              </tr>
            </thead>
            <tbody>
              {tracks.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "16px" }}>
                    No tests yet.
                  </td>
                </tr>
              ) : (
                tracks.map((t, idx) => (
                  <tr key={t.id ?? idx} className={t.inProgress ? "in-progress-row" : ""}>
                    <td>{idx + 1}</td>
                    <td>
                      {t.dateTimeDisplay}
                      {t.inProgress && <span className="in-progress-pill"> (in-progress)</span>}
                    </td>
                    <td>{t.wpm !== null ? Math.round(t.wpm) : "-"}</td>
                    <td>{t.accuracy !== null ? `${Math.round(t.accuracy)}%` : "-"}</td>
                    <td>{t.errors !== null ? t.errors : "-"}</td>
                    <td>{t.rawWpm !== null ? Math.round(t.rawWpm) : "-"}</td>
                    <td>{t.highestWpm !== null ? Math.round(t.highestWpm) : "-"}</td>
                    <td>{t.lowestWpm !== null && Number.isFinite(t.lowestWpm) ? Math.round(t.lowestWpm) : "-"}</td>
                    <td>{t.testDuration ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="tracks-actions">
          <button className="clear-btn" onClick={onClearAll}>Clear All</button>
        </div>
      </div>
    </PopIn>
  );
}
