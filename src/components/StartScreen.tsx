import React from 'react';
import './StartScreen.css'; // CSS 파일도 생성 예정

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="start-screen">
      <h1>Apple Collector Game</h1>
      <button onClick={onStartGame} className="start-button">
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;
