import React from 'react';
import './TimerBar.css'; // Import the CSS

interface TimerBarProps {
  timeLeft: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ timeLeft }) => {
  return (
    <div className="timer-bar">
      <p>Time Left: {timeLeft}s</p>
    </div>
  );
};

export default TimerBar;
