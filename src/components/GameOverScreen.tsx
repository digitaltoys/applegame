import React, { useEffect, useState } from 'react';
import './GameOverScreen.css'; // CSS 파일도 생성 예정

// Copied from StartScreen.tsx
interface ScoreEntry {
  id: string;
  key: number;
  value: {
    name: string;
    createdAt?: string;
  };
}

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, onMainMenu }) => {
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isScoreSaved, setIsScoreSaved] = useState<boolean>(false);

  // Leaderboard states - Copied from StartScreen.tsx
  const [leaderboardData, setLeaderboardData] = useState<ScoreEntry[]>([]);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // This useEffect is now only for updating the *local* personal best.
  // The displayed highScore state is set by handleFetchLeaderboard.
  useEffect(() => {
    const localHighScoreString = localStorage.getItem('appleCollectorHighScore');
    const localHighScore = localHighScoreString ? parseInt(localHighScoreString, 10) : 0;
    if (score > localHighScore) {
      localStorage.setItem('appleCollectorHighScore', score.toString());
    }
    // We no longer set the highScore state here based on the current game's score directly.
    // It's updated via fetching leaderboard data.
  }, [score]); // Only depends on score

  // Load player name from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem('lastPlayerName');
    if (storedName) {
      setPlayerName(storedName);
    }
    window.scrollTo(0, 0); // 페이지 최상단으로 스크롤
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSaveScore = async () => {
    setSaveMessage('저장 중...');
    setIsScoreSaved(false);

    const trimmedPlayerName = playerName.trim();
    if (!trimmedPlayerName) {
      setSaveMessage('이름을 입력해주세요!');
      // setIsScoreSaved is already false
      return;
    }

    // Save player name to localStorage
    localStorage.setItem('lastPlayerName', trimmedPlayerName);

    const rankingsString = localStorage.getItem('appleCollectorRankings');
    let rankings = [];
    if (rankingsString) {
      try {
        rankings = JSON.parse(rankingsString);
        if (!Array.isArray(rankings)) { // Ensure rankings is an array
          rankings = [];
        }
      } catch (error) {
        console.error("Error parsing rankings from localStorage", error);
        rankings = []; // Reset to empty array on error
      }
    }

    const newScoreEntry = { name: trimmedPlayerName, score: score };
    rankings.push(newScoreEntry);

    // Sort by score descending
    rankings.sort((a, b) => b.score - a.score);

    // Keep only top 10
    const top10Rankings = rankings.slice(0, 10);

    try {
      localStorage.setItem('appleCollectorRankings', JSON.stringify(top10Rankings));
      // PlayerName is not cleared here anymore to display it after saving.
      // setPlayerName('');

      // Send to CouchDB
      const couchDbUrl = 'http://couchdb.ioplug.net/scoredb';
      const scoreDataForDb = {
        type: 'score',
        name: trimmedPlayerName, // Use trimmed name for saving to DB
        score: score,
        createdAt: new Date().toISOString(),
      };

      // Using a separate try-catch for the fetch operation
      try {
        const response = await fetch(couchDbUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('user1:any')}`, // Replace with actual credentials
          },
          body: JSON.stringify(scoreDataForDb),
        });

        if (response.ok) {
          setSaveMessage(`${trimmedPlayerName}님의 점수: ${score}점이 로컬 및 온라인 랭킹에 모두 저장되었습니다!`);
          setIsScoreSaved(true);
        } else {
          const errorData = await response.text();
          console.error('Failed to save score to CouchDB:', response.status, errorData);
          setSaveMessage(`${trimmedPlayerName}님의 점수: ${score}점이 로컬에는 저장되었지만, 온라인 랭킹 저장에 실패했습니다. (서버 응답: ${response.status})`);
          setIsScoreSaved(true); // Local save was successful
        }
      } catch (networkError) {
        console.error('Network error when trying to save score to CouchDB:', networkError);
        setSaveMessage(`${trimmedPlayerName}님의 점수: ${score}점이 로컬에는 저장되었지만, 온라인 랭킹 저장 중 네트워크 오류가 발생했습니다.`);
        setIsScoreSaved(true); // Local save was successful
      }

    } catch (error) {
      console.error("Error saving rankings to localStorage", error);
      setSaveMessage('로컬 점수 저장 중 오류가 발생했습니다.');
      setIsScoreSaved(false);
    }
    // After saving, fetch the leaderboard again to show the latest scores
    handleFetchLeaderboard();
  };

  // handleFetchLeaderboard - Copied and adapted from StartScreen.tsx
  const handleFetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    setLeaderboardError(null);
    const url = 'http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_score?descending=true&limit=10';

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('user1:any')}`,
        }
      });
      if (!response.ok) {
        const errorMsgText = await response.text();
        let errorDetail = "";
        try {
          const errorData = JSON.parse(errorMsgText);
          errorDetail = ` - ${errorData.reason || errorData.error || errorMsgText}`;
        } catch (e) {
          errorDetail = ` - ${errorMsgText.substring(0, 100)}`;
        }
        throw new Error(`Failed to fetch leaderboard: ${response.status}${errorDetail}`);
      }
      const data = await response.json();
      const fetchedRows = data.rows || [];
      setLeaderboardData(fetchedRows);

      if (fetchedRows.length > 0) {
        // Scores are in entry.key
        const maxScore = fetchedRows.reduce((max: number, entry: ScoreEntry) => entry.key > max ? entry.key : max, 0);
        setHighScore(maxScore);
      } else {
        setHighScore(0); // No scores on the leaderboard
      }
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }

  // Fetch leaderboard when component mounts
  useEffect(() => {
    handleFetchLeaderboard();
    // The dependency array is empty, so this runs once on mount.
  }, []);


  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <div className="score-summary">
        <p>High Score: {highScore}</p>
        <p>Your Score: {score}</p>
      </div>

      <div className="save-score-container">
        {isScoreSaved ? (
          <div className="score-display-after-save">
            {playerName}님의 점수: {score}
          </div>
        ) : (
          <div className="save-score-section">
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isScoreSaved}
            />
            <button
              onClick={handleSaveScore}
              disabled={isScoreSaved}
            >
              점수 저장
            </button>
          </div>
        )}
        {saveMessage && (
          <p className={`save-status-message ${isScoreSaved ? 'success' : (!playerName.trim() && saveMessage === '이름을 입력해주세요!' ? 'error' : (saveMessage.includes('오류') || saveMessage.includes('실패') ? 'error' : 'info'))}`}>
            {saveMessage}
          </p>
        )}
      </div>

      {/* Leaderboard Section - Copied and adapted from StartScreen.tsx */}
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
              {leaderboardData.map((scoreEntry, index) => (
                <tr key={scoreEntry.id || index}>
                  <td>{index + 1}</td>
                  <td>{scoreEntry.value.name}</td>
                  <td>{scoreEntry.key}</td>
                  <td>{scoreEntry.value.createdAt ? new Date(scoreEntry.value.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="buttons">
        <button onClick={onRestart} className="restart-button">
          Restart Game
        </button>
        <button onClick={onMainMenu} className="main-menu-button">
          Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
