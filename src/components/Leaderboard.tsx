import React from 'react';
import './Leaderboard.css';

interface ScoreEntry {
  id: string; // CouchDB-generated _id
  key: number; // View key (score)
  value: { // View value
    name: string;
    // createdAt can also be part of value if included in the view
    createdAt?: string;
  };
  // If not using a view, and fetching documents directly:
  // name?: string;
  // score?: number;
  // createdAt?: string;
}

interface LeaderboardProps {
  scores: ScoreEntry[];
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onClose }) => {
  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-container">
        <h2>Leaderboard</h2>
        {scores.length === 0 ? (
          <p>No scores yet, or unable to load leaderboard.</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank">Rank</th>
                <th>Name</th>
                <th className="score">Score</th>
                {/* Optional: Add createdAt if available and desired */}
                {/* <th>Date</th> */}
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => (
                <tr key={entry.id || index}>
                  <td className="rank">{index + 1}</td>
                  <td>{entry.value?.name || 'N/A'}</td>
                  <td className="score">{entry.key ?? 'N/A'}</td>
                  {/* Optional: Display createdAt */}
                  {/* <td>{entry.value?.createdAt ? new Date(entry.value.createdAt).toLocaleDateString() : 'N/A'}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="close-button-container">
          <button onClick={onClose} className="leaderboard-close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
