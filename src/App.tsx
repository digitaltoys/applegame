import './App.css';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import TimerBar from './components/TimerBar';
import Controls from './components/Controls';
import SumDisplay from './components/SumDisplay';
import { useState, useEffect } from 'react'; // Import useState and useEffect
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
    // 게임 상태 초기화
    setScore(0);
    setTimeLeft(INITIAL_TIME_LEFT); // Reset timeLeft to INITIAL_TIME_LEFT
    setCurrentSum(0);
    setIsPaused(false); // 일시정지 상태 해제

    // Grid 컴포넌트 리셋을 위한 key 변경
    // setGridKey 호출 전에 다른 상태들이 먼저 업데이트되도록 함
    setGridKey(prevKey => prevKey + 1);

    // 게임 상태를 'Playing'으로 변경
    // 모든 상태 초기화 및 Grid 리셋 준비 후 게임 시작
    setGameState('Playing');
  };

  const handleMainMenu = () => {
    setGameState('StartScreen');
    setIsPaused(true); // 게임이 정지된 상태로 시작 화면으로 돌아가도록
    setScore(0); // 점수 초기화
    setTimeLeft(INITIAL_TIME_LEFT); // 남은 시간 초기화
    setCurrentSum(0); // 현재 합계 초기화
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
              <div className='comment'>합이 10이되게 모드세요</div>
              <SumDisplay sum={currentSum} />
            </div>
            <Grid setScore={setScore} setCurrentSum={setCurrentSum} key={gridKey} onGameWin={handleGameWin} isPaused={isPaused} /> {/* onGameWin 추가, isPaused prop 추가 */}
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
