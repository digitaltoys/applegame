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

  const handleSaveScore = () => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요!');
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
      // 로컬 저장 성공 알림은 CouchDB 결과 후 한 번에 처리하거나, 여기서 일단 유지하고 CouchDB 실패 시 추가 알림
      // alert('점수가 로컬에 저장되었습니다!');
      setPlayerName(''); // Clear player name after saving, do this regardless of CouchDB result for now

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
          },
          body: JSON.stringify(scoreDataForDb),
        });

        if (response.ok) {
          // console.log('Score successfully saved to CouchDB:', await response.json()); // 주석 처리
          alert('점수가 로컬 및 온라인 랭킹에 모두 저장되었습니다!');
        } else {
          const errorData = await response.text(); // Use text() in case response is not JSON
          console.error('Failed to save score to CouchDB:', response.status, errorData);
          alert(`로컬에는 점수가 저장되었지만, 온라인 랭킹 저장에 실패했습니다. (서버 응답: ${response.status})`);
        }
      } catch (networkError) {
        console.error('Network error when trying to save score to CouchDB:', networkError);
        alert(`로컬에는 점수가 저장되었지만, 온라인 랭킹 저장 중 네트워크 오류가 발생했습니다.`);
      }

    } catch (error) {
      console.error("Error saving rankings to localStorage", error);
      alert('로컬 점수 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <div className="score-summary">
        <p>Your Score: {score}</p>
        <p>High Score: {highScore}</p>
      </div>
      <div className="save-score-section" style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ padding: '10px', marginRight: '10px', fontSize: '1rem' }}
        />
        <button
          onClick={handleSaveScore} // Directly use the async function
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer' }}
        >
          점수 저장
        </button>
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
