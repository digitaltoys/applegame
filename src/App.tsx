import './App.css';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import TimerBar from './components/TimerBar';
import Controls from './components/Controls';
import SumDisplay from './components/SumDisplay';
import React, { useState } from 'react'; // Import useState

function App() {
  // Basic state placeholders
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);

  const handleRestart = () => {
    // Placeholder for restart logic
    console.log("Restarting game...");
    setScore(0);
    setTimeLeft(60);
    setIsPaused(false);
    setCurrentSum(0);
  };

  const handlePauseToggle = () => {
    // Placeholder for pause/resume logic
    console.log("Toggling pause...");
    setIsPaused(!isPaused);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Apple Collector Game</h1>
      </header>
      <main className="game-area">
        <div className="game-info">
          <ScoreBoard score={score} />
          <TimerBar timeLeft={timeLeft} />
          <SumDisplay sum={currentSum} />
        </div>
        <Grid />
      </main>
      <footer className="app-controls">
        <Controls
          onRestart={handleRestart}
          onPauseToggle={handlePauseToggle}
          isPaused={isPaused}
        />
      </footer>
    </div>
  );
}

export default App;
