import './App.css';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import TimerBar from './components/TimerBar';
import Controls from './components/Controls';
import SumDisplay from './components/SumDisplay';
import ComboDisplay from './components/ComboDisplay';
import { useState, useEffect, useCallback } from 'react'; // Import useState, useEffect and useCallback
import StartScreen from './components/StartScreen'; // 추가
import GameOverScreen from './components/GameOverScreen'; // 추가
import leaderboardMonitor from './utils/leaderboardMonitor';
import { getNotificationEnabled } from './utils/notifications';
import { initializeChannel } from './utils/channel';
import { type GameRule, GAME_RULES } from './types/gameRules';
import { CoupangAd } from './components/CoupangAd.jsx'

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
  const [comboCount, setComboCount] = useState(0); // 콤보 카운트
  const [lastRemoveTime, setLastRemoveTime] = useState<number>(0); // 마지막 제거 시간 (ms)
  const [selectedRule, setSelectedRule] = useState<GameRule>(() => {
    // 로컬 스토리지에서 저장된 룰 불러오기
    const savedRule = localStorage.getItem('selectedGameRule') as GameRule;
    return savedRule && savedRule in GAME_RULES ? savedRule : 'classic';
  }); // 선택된 게임 룰

  // 선택된 룰을 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('selectedGameRule', selectedRule);
  }, [selectedRule]);

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

  // useEffect for combo timeout check
  useEffect(() => {
    const COMBO_TIME_WINDOW = 3000; // 3초

    const comboTimeoutCheck = setInterval(() => {
      if (gameState === 'Playing' && !isPaused && comboCount > 1 && lastRemoveTime > 0) {
        const timeSinceLastRemove = Date.now() - lastRemoveTime;
        if (timeSinceLastRemove > COMBO_TIME_WINDOW) {
          setComboCount(0); // 콤보 카운트 초기화
          setLastRemoveTime(0); // 마지막 제거 시간 초기화
        }
      }
    }, 100); // 100ms마다 체크

    return () => clearInterval(comboTimeoutCheck);
  }, [gameState, isPaused, comboCount, lastRemoveTime]);

  // useEffect for initialization (channel and leaderboard monitoring)
  useEffect(() => {
    // 채널 초기화
    initializeChannel();

    // 알림 설정이 활성화된 경우에만 모니터링 시작
    if (getNotificationEnabled()) {
      console.log('리더보드 모니터링 시작');
      leaderboardMonitor.startMonitoring();
    }

    // 컴포넌트 언마운트 시 모니터링 중단
    return () => {
      if (leaderboardMonitor.isActive()) {
        console.log('리더보드 모니터링 중단');
        leaderboardMonitor.stopMonitoring();
      }
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  const handleStartGame = () => {
    const currentRuleConfig = GAME_RULES[selectedRule];
    setGameState('Playing');
    setScore(0);
    setTimeLeft(currentRuleConfig.timeLimit); // 선택된 룰의 시간 제한 사용
    setIsPaused(false);
    setCurrentSum(0); // currentSum도 초기화
    setComboCount(0); // 콤보 카운트 초기화
    setLastRemoveTime(0); // 마지막 제거 시간 초기화
    setGridKey(prevKey => prevKey + 1); // Grid 컴포넌트 리셋
    console.log(`Game started with rule: ${currentRuleConfig.name}`);
  };

  const handleGameWin = () => {
    setGameState('GameOver');
    setIsPaused(true); // Ensure timer stops and no more interaction
    console.log("Congratulations! You cleared all apples!");
    // 추가적으로 게임 승리 상태를 저장하거나 다른 로직을 수행할 수 있습니다.
  };

  const handlePauseToggle = useCallback(() => {
    if (gameState !== 'Playing') return;
    // Placeholder for pause/resume logic
    // console.log("Toggling pause..."); // Removed
    setIsPaused(!isPaused);
  }, [gameState, isPaused]);

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
  }, [handlePauseToggle]); // Include handlePauseToggle in dependency array

  const handleRestart = () => {
    // 게임 상태 초기화
    const currentRuleConfig = GAME_RULES[selectedRule];
    setScore(0);
    setTimeLeft(currentRuleConfig.timeLimit); // 선택된 룰의 시간 제한 사용
    setCurrentSum(0);
    setIsPaused(false); // 일시정지 상태 해제
    setComboCount(0); // 콤보 카운트 초기화
    setLastRemoveTime(0); // 마지막 제거 시간 초기화

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
    setComboCount(0); // 콤보 카운트 초기화
    setLastRemoveTime(0); // 마지막 제거 시간 초기화
  };

  return (
    <div className="app-container">
      {gameState === 'StartScreen' ? (
        <StartScreen
          onStartGame={handleStartGame}
          selectedRule={selectedRule}
          onRuleChange={setSelectedRule}
        />
      ) : gameState === 'Playing' ? (
        <>
          <header className="app-header">
            <h1>Apple Collector Game</h1>
          </header>
          <main className="game-area">
            <div className="game-info">
              <ScoreBoard score={score} />
              <TimerBar timeLeft={timeLeft} />
              <div className='comment'>{GAME_RULES[selectedRule].targetSum}을 모으세요</div>
              <SumDisplay sum={currentSum} />
            </div>
            {GAME_RULES[selectedRule].enableCombo && (
              <ComboDisplay comboCount={comboCount} lastRemoveTime={lastRemoveTime} />
            )}
            <Grid
              setScore={setScore}
              setCurrentSum={setCurrentSum}
              key={gridKey}
              onGameWin={handleGameWin}
              isPaused={isPaused}
              comboCount={comboCount}
              setComboCount={setComboCount}
              lastRemoveTime={lastRemoveTime}
              setLastRemoveTime={setLastRemoveTime}
              targetSum={GAME_RULES[selectedRule].targetSum}
              enableCombo={GAME_RULES[selectedRule].enableCombo}
              enableAppleBonus={GAME_RULES[selectedRule].enableAppleBonus}
            /> {/* 콤보 상태 props 추가 */}
          </main>
          <footer className="app-controls">
            <Controls
              onRestart={handleRestart}
              onPauseToggle={handlePauseToggle}
              isPaused={isPaused}
              onMainMenu={handleMainMenu}
            />
          </footer>
        </>
      ) : ( // gameState === 'GameOver'
        <GameOverScreen
          score={score}
          selectedRule={selectedRule}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}
      <CoupangAd />
    </div>
  );
}

export default App;
