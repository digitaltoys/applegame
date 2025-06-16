import './App.css';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import TimerBar from './components/TimerBar';
import Controls from './components/Controls';
import SumDisplay from './components/SumDisplay';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect

// Define INITIAL_TIME_LEFT constant
const INITIAL_TIME_LEFT = 60;

function App() {
  // Basic state placeholders
  const [score, setScore] = useState(0);
  // Set timeLeft initial state to INITIAL_TIME_LEFT
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LEFT);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);

  // useEffect for timer logic
  useEffect(() => {
    // Timer interval
    const interval = setInterval(() => {
      if (!isPaused && timeLeft > 0) {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }
    }, 1000);

    // Game over condition
    if (timeLeft === 0) {
      console.log("Game Over!");
      setIsPaused(true);
    }

    // Clear interval on component unmount or when isPaused/timeLeft changes
    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const handleRestart = () => {
    // Placeholder for restart logic
    console.log("Restarting game...");
    setScore(0);
    setTimeLeft(INITIAL_TIME_LEFT); // Reset timeLeft to INITIAL_TIME_LEFT
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
        <Grid setScore={setScore} />
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
