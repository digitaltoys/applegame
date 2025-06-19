import React, { useState, useEffect } from 'react';
import './StartScreen.css';

// Define the structure of a score entry from CouchDB view
interface ScoreEntry {
  id: string; // CouchDB-generated _id
  key: number; // View key (score)
  value: { // View value
    name: string;
    createdAt?: string;
  };
}

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [leaderboardData, setLeaderboardData] = useState<ScoreEntry[]>([]);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  const handleFetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    setLeaderboardError(null);
    // Assuming the CouchDB view is set up at:
    // http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_score?descending=true&limit=10
    const url = 'http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_score?descending=true&limit=10';

    try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('user1:any')}`, // Replace with actual credentials
          }
      });
      if (!response.ok) {
        const errorMsgText = await response.text(); // Get raw error text
        let errorDetail = "";
        try {
            // Try to parse as JSON for structured CouchDB errors
            const errorData = JSON.parse(errorMsgText);
            errorDetail = ` - ${errorData.reason || errorData.error || errorMsgText}`;
        } catch (e) {
            // If not JSON, use the raw text (or part of it)
            errorDetail = ` - ${errorMsgText.substring(0, 100)}`; // Limit length if it's HTML/long
        }
        throw new Error(`Failed to fetch leaderboard: ${response.status}${errorDetail}`);
      }
      const data = await response.json();
      // The actual scores are in data.rows
      setLeaderboardData(data.rows || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLeaderboardError(`Could not load leaderboard data. Please try again later. Error: ${errorMessage}`);
      setLeaderboardData([]); // Clear data on error
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    handleFetchLeaderboard();
  }, []);

  return (
    <div className="start-screen">
      <h1>Apple Collector Game</h1>
      <button onClick={onStartGame} className="start-button">
        Start Game
      </button>

      <div className="leaderboard-container-inline">
        <h2>Leaderboard</h2>
        {isLoadingLeaderboard && <p className="leaderboard-message">Loading leaderboard...</p>}
        {leaderboardError && <p className="leaderboard-message error">{leaderboardError}</p>}
        {!isLoadingLeaderboard && !leaderboardError && leaderboardData.length === 0 && (
          <p className="leaderboard-message">No scores yet...</p>
        )}
        {!isLoadingLeaderboard && !leaderboardError && leaderboardData.length > 0 && (
          <table className="leaderboard-table-inline">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((score, index) => (
                <tr key={score.id || index}>
                  <td>{index + 1}</td>
                  <td>{score.value.name}</td>
                  <td>{score.key}</td>
                  <td>{score.value.createdAt ? new Date(score.value.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StartScreen;
