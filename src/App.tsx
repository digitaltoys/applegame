import './App.css';
import './App.css';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import TimerBar from './components/TimerBar';
import Controls from './components/Controls';
import SumDisplay from './components/SumDisplay';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import StartScreen from './components/StartScreen'; // 추가
import GameOverScreen from './components/GameOverScreen'; // 추가

// Define INITIAL_TIME_LEFT constant
const INITIAL_TIME_LEFT = 60;

type GameState = 'StartScreen' | 'Playing' | 'GameOver';

function App() {
  // Basic state placeholders
  const [score, setScore] = useState(0);
  // Set timeLeft initial state to INITIAL_TIME_LEFT
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LEFT);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);
  const [gameState, setGameState] = useState<GameState>('StartScreen');
  const [gridKey, setGridKey] = useState(0); // Grid 리셋을 위한 key

  // useEffect for timer logic
  useEffect(() => {
    // Timer interval
    const interval = setInterval(() => {
      if (gameState === 'Playing' && !isPaused && timeLeft > 0) {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }
    }, 1000);

    // Game over condition
    if (timeLeft === 0 && gameState === 'Playing') { // gameState 'Playing' 조건 추가
      console.log("Game Over!");
      setGameState('GameOver');
    }

    // Clear interval on component unmount or when isPaused/timeLeft changes
    return () => clearInterval(interval);
  }, [gameState, isPaused, timeLeft]);

  const handleStartGame = () => {
    setGameState('Playing');
    setScore(0);
    setTimeLeft(INITIAL_TIME_LEFT);
    setIsPaused(false);
    setCurrentSum(0); // currentSum도 초기화
    setGridKey(prevKey => prevKey + 1); // Grid 컴포넌트 리셋
    console.log("Game started"); // Grid 초기화 로직은 Grid 컴포넌트 내부 또는 App에서 호출 필요
  };

  const handleGameWin = () => {
    setGameState('GameOver');
    setIsPaused(true); // Ensure timer stops and no more interaction
    console.log("Congratulations! You cleared all apples!");
    // 추가적으로 게임 승리 상태를 저장하거나 다른 로직을 수행할 수 있습니다.
  };

  // useEffect for keyboard controls (pause/resume)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        handlePauseToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  const handleRestart = () => {
    // Placeholder for restart logic
    // console.log("Restarting game..."); // Removed
    setScore(0);
    setTimeLeft(INITIAL_TIME_LEFT); // Reset timeLeft to INITIAL_TIME_LEFT
    setIsPaused(false);
    setCurrentSum(0);
    setGameState('Playing'); // 다른 상태 설정 후, gridKey 설정 전에 gameState 변경
    setGridKey(prevKey => prevKey + 1); // Grid 컴포넌트 리셋
  };

  const handleMainMenu = () => {
    setGameState('StartScreen');
    setIsPaused(true); // 게임이 정지된 상태로 시작 화면으로 돌아가도록
    // setCurrentSum(0); // 선택적 초기화 주석 처리 유지
    // setTimeLeft(INITIAL_TIME_LEFT); // 선택적 초기화 주석 처리 유지
  };

  const handlePauseToggle = () => {
    if (gameState !== 'Playing') return;
    // Placeholder for pause/resume logic
    // console.log("Toggling pause..."); // Removed
    setIsPaused(!isPaused);
  };

  return (
    <div className="app-container">
      {gameState === 'StartScreen' ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : gameState === 'Playing' ? (
        <>
          <header className="app-header">
            <h1>Apple Collector Game</h1>
          </header>
          <main className="game-area">
            <div className="game-info">
              <ScoreBoard score={score} />
              <TimerBar timeLeft={timeLeft} />
              <SumDisplay sum={currentSum} />
            </div>
            <Grid setScore={setScore} setCurrentSum={setCurrentSum} key={gridKey} onGameWin={handleGameWin} /> {/* onGameWin 추가 */}
          </main>
          <footer className="app-controls">
            <Controls
              onRestart={handleRestart}
              onPauseToggle={handlePauseToggle}
              isPaused={isPaused}
            />
          </footer>
        </>
      ) : ( // gameState === 'GameOver'
        <GameOverScreen
          score={score}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}

export default App;
