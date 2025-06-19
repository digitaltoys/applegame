import React, { useEffect, useState } from 'react';
import './GameOverScreen.css'; // CSS 파일도 생성 예정

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

  useEffect(() => {
    const storedHighScore = localStorage.getItem('appleCollectorHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      localStorage.setItem('appleCollectorHighScore', score.toString());
      setHighScore(score);
    }
  }, [score, highScore]);

  const handleSaveScore = async () => {
    setSaveMessage('저장 중...');
    setIsScoreSaved(false);

    if (!playerName.trim()) {
      setSaveMessage('이름을 입력해주세요!');
      // setIsScoreSaved is already false
      return;
    }

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

    const newScoreEntry = { name: playerName, score: score };
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
        name: playerName,
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
          setSaveMessage(`${playerName}님의 점수: ${score}점이 로컬 및 온라인 랭킹에 모두 저장되었습니다!`);
          setIsScoreSaved(true);
        } else {
          const errorData = await response.text();
          console.error('Failed to save score to CouchDB:', response.status, errorData);
          setSaveMessage(`${playerName}님의 점수: ${score}점이 로컬에는 저장되었지만, 온라인 랭킹 저장에 실패했습니다. (서버 응답: ${response.status})`);
          setIsScoreSaved(true); // Local save was successful
        }
      } catch (networkError) {
        console.error('Network error when trying to save score to CouchDB:', networkError);
        setSaveMessage(`${playerName}님의 점수: ${score}점이 로컬에는 저장되었지만, 온라인 랭킹 저장 중 네트워크 오류가 발생했습니다.`);
        setIsScoreSaved(true); // Local save was successful
      }

    } catch (error) {
      console.error("Error saving rankings to localStorage", error);
      setSaveMessage('로컬 점수 저장 중 오류가 발생했습니다.');
      setIsScoreSaved(false);
    }
  };

  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <div className="score-summary">
        <p>Your Score: {score}</p>
        <p>High Score: {highScore}</p>
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
