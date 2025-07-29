import React from 'react';
import './StartScreen.css';
import NotificationSettings from './NotificationSettings';
import Leaderboard from './Leaderboard';

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

      <Leaderboard 
        showAsModal={false}
      />
      
      <NotificationSettings />
    </div>
  );
};

export default StartScreen;
