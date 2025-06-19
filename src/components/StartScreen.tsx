import React, { useState, useEffect } from 'react';
import './StartScreen.css';
import Leaderboard from './Leaderboard'; // Import Leaderboard component

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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<ScoreEntry[]>([]);

  const handleFetchLeaderboard = async () => {
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
      setShowLeaderboard(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Optionally, inform the user with an alert or a message on the screen
      alert(`Could not load leaderboard data. Please try again later.\nError: ${error instanceof Error ? error.message : String(error)}`);
      setLeaderboardData([]); // Clear data on error
    }
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
  };

  return (
    <div className="start-screen">
      <h1>Apple Collector Game</h1>
      <button onClick={onStartGame} className="start-button">
        Start Game
      </button>
      <button onClick={handleFetchLeaderboard} className="leaderboard-button">
        View Leaderboard
      </button>
      {showLeaderboard && (
        <Leaderboard scores={leaderboardData} onClose={handleCloseLeaderboard} />
      )}
    </div>
  );
};

export default StartScreen;
