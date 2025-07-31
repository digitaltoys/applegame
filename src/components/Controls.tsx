import React from 'react';
import './Controls.css'; // Import the CSS

interface ControlsProps {
  onRestart: () => void;
  onPauseToggle: () => void;
  isPaused: () => void;
  onMainMenu: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onRestart, onMainMenu, onPauseToggle, isPaused }) => {
  return (
    <div className="controls">
      <button onClick={onRestart}>Restart</button>
      <button onClick={onMainMenu}>나가기</button>
      {/* <button onClick={onPauseToggle}>{isPaused ? 'Resume' : 'Pause'}</button> */}
    </div>
  );
};

export default Controls;
