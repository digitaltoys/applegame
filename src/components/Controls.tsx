import React from 'react';
import './Controls.css'; // Import the CSS

interface ControlsProps {
  onRestart: () => void;
  onPauseToggle: () => void;
  isPaused: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onRestart, onPauseToggle, isPaused }) => {
  return (
    <div className="controls">
      <button onClick={onRestart}>Restart</button>
      <button onClick={onPauseToggle}>{isPaused ? 'Resume' : 'Pause'}</button>
    </div>
  );
};

export default Controls;
