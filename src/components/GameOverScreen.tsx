import React, { useEffect, useState, useRef } from 'react';
import './GameOverScreen.css'; // CSS 파일도 생성 예정
import { notifyLeaderboardUpdate } from '../utils/notifications';
import { getCurrentChannel } from '../utils/channel';
import Leaderboard, { type LeaderboardRef } from './Leaderboard';
import { type GameRule, GAME_RULES } from '../types/gameRules';


interface GameOverScreenProps {
  score: number;
  selectedRule: GameRule;
  onRestart: () => void;
  onMainMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, selectedRule, onRestart, onMainMenu }) => {
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isScoreSaved, setIsScoreSaved] = useState<boolean>(false);

  // Track previous leaderboard leader for notification
  const [previousLeader, setPreviousLeader] = useState<{name: string, score: number} | null>(null);
  
  // Leaderboard ref to trigger refresh
  const leaderboardRef = useRef<LeaderboardRef>(null);

  // 로컬 최고점수 업데이트
  useEffect(() => {
    const localHighScoreString = localStorage.getItem('appleCollectorHighScore');
    const localHighScore = localHighScoreString ? parseInt(localHighScoreString, 10) : 0;
    if (score > localHighScore) {
      localStorage.setItem('appleCollectorHighScore', score.toString());
      setHighScore(score);
    } else {
      setHighScore(localHighScore);
    }
  }, [score]);

  // Load player name from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem('lastPlayerName');
    if (storedName) {
      setPlayerName(storedName);
    }
    window.scrollTo(0, 0); // 페이지 최상단으로 스크롤
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSaveScore = async () => {
    setSaveMessage('저장 중...');
    setIsScoreSaved(false);

    const trimmedPlayerName = playerName.trim();
    if (!trimmedPlayerName) {
      setSaveMessage('이름을 입력해주세요!');
      // setIsScoreSaved is already false
      return;
    }

    // Save player name to localStorage
    localStorage.setItem('lastPlayerName', trimmedPlayerName);

    const rankingsString = localStorage.getItem('appleCollectorRankings');
    let rankings = [];
    if (rankingsString) {
      try {
        rankings = JSON.parse(rankingsString);
        if (!Array.isArray(rankings)) { // Ensure rankings is an array
          rankings = [];
        }
      } catch (error) {
        console.error("Error parsing rankings from localStorage", error);
        rankings = []; // Reset to empty array on error
      }
    }

    const currentChannel = getCurrentChannel();
    const ruleConfig = GAME_RULES[selectedRule];
    const newScoreEntry = { 
      name: trimmedPlayerName, 
      score: score, 
      tag: [ruleConfig.tag],
      rule: selectedRule,
      channel: currentChannel
    };
    rankings.push(newScoreEntry);

    // Sort by score descending
    rankings.sort((a, b) => b.score - a.score);

    // Keep only top 10
    const top10Rankings = rankings.slice(0, 10);

    try {
      localStorage.setItem('appleCollectorRankings', JSON.stringify(top10Rankings));
      // PlayerName is not cleared here anymore to display it after saving.
      // setPlayerName('');

      // Send to CouchDB
      const couchDbUrl = 'http://couchdb.ioplug.net/scoredb';
      const scoreDataForDb = {
        type: 'score',
        name: trimmedPlayerName, // Use trimmed name for saving to DB
        score: score,
        createdAt: new Date().toISOString(),
        channel: currentChannel,
        tag: [ruleConfig.tag],
        rule: selectedRule
      };

      // Using a separate try-catch for the fetch operation
      try {
        const response = await fetch(couchDbUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('user1:any')}`, // Replace with actual credentials
          },
          body: JSON.stringify(scoreDataForDb),
        });

        if (response.ok) {
          setSaveMessage(`${trimmedPlayerName}님의 점수: ${score}점이 로컬 및 온라인 랭킹에 모두 저장되었습니다!`);
          setIsScoreSaved(true);
        } else {
          const errorData = await response.text();
          console.error('Failed to save score to CouchDB:', response.status, errorData);
          setSaveMessage(`${trimmedPlayerName}님의 점수: ${score}점이 로컬에는 저장되었지만, 온라인 랭킹 저장에 실패했습니다. (서버 응답: ${response.status})`);
          setIsScoreSaved(true); // Local save was successful
        }
      } catch (networkError) {
        console.error('Network error when trying to save score to CouchDB:', networkError);
        setSaveMessage(`${trimmedPlayerName}님의 점수: ${score}점이 로컬에는 저장되었지만, 온라인 랭킹 저장 중 네트워크 오류가 발생했습니다.`);
        setIsScoreSaved(true); // Local save was successful
      }

    } catch (error) {
      console.error("Error saving rankings to localStorage", error);
      setSaveMessage('로컬 점수 저장 중 오류가 발생했습니다.');
      setIsScoreSaved(false);
    }
    // Leaderboard를 새로고침하여 최신 점수 표시
    leaderboardRef.current?.refresh();
  };

  // 리더보드에서 리더 정보를 받을 때 알림 처리
  const handleLeaderFetched = async (leader: { name: string; score: number } | null) => {
    if (leader && previousLeader) {
      const hasNewLeader = (
        previousLeader.name !== leader.name || 
        previousLeader.score !== leader.score
      );
      
      if (hasNewLeader) {
        console.log('New leader detected:', leader);
        await notifyLeaderboardUpdate(leader.name, leader.score);
      }
    }
    
    if (leader) {
      setPreviousLeader(leader);
      // 온라인 최고점수가 로컬보다 높으면 업데이트
      if (leader.score > highScore) {
        setHighScore(leader.score);
      }
    }
  };


  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <div className="score-summary">
        <p className='high-score'>High Score: {highScore}</p>
        <p className='your-score'>Your Score: {score}</p>
      </div>

      <div className="save-score-container">
        {isScoreSaved ? (
          <div className="score-display-after-save">
            {playerName}님의 점수: {score}
          </div>
        ) : (
          <div className="save-score-section">
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isScoreSaved}
            />
            <button
              onClick={handleSaveScore}
              disabled={isScoreSaved}
            >
              점수 저장
            </button>
          </div>
        )}
        {saveMessage && (
          <p className={`save-status-message ${isScoreSaved ? 'success' : (!playerName.trim() && saveMessage === '이름을 입력해주세요!' ? 'error' : (saveMessage.includes('오류') || saveMessage.includes('실패') ? 'error' : 'info'))}`}>
            {saveMessage}
          </p>
        )}
      </div>

      <Leaderboard 
        ref={leaderboardRef}
        showAsModal={false}
        onLeaderFetched={handleLeaderFetched}
      />

      <div className="buttons">
        <button onClick={onRestart} className="restart-button">
          Restart Game
        </button>
        <button onClick={onMainMenu} className="main-menu-button">
          Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
