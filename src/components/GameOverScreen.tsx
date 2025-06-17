import React, { useEffect, useState } from 'react';
import './GameOverScreen.css'; // CSS 파일도 생성 예정

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, onMainMenu }) => {
  const [highScore, setHighScore] = useState(0);

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

  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <div className="score-summary">
        <p>Your Score: {score}</p>
        <p>High Score: {highScore}</p>
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
