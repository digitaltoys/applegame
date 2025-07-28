import React, { useState, useEffect } from 'react';
import './ComboDisplay.css';

interface ComboDisplayProps {
  comboCount: number;
  lastRemoveTime: number;
}

const ComboDisplay: React.FC<ComboDisplayProps> = ({ comboCount, lastRemoveTime }) => {
  const COMBO_TIME_WINDOW = 3000; // 3초
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [animationKey, setAnimationKey] = useState(0);
  const [previousComboCount, setPreviousComboCount] = useState(comboCount);
  
  // 콤보 카운트 변화 감지 및 애니메이션 트리거
  useEffect(() => {
    if (comboCount > previousComboCount && comboCount > 1) {
      setAnimationKey(prev => prev + 1); // 애니메이션 재시작을 위한 키 변경
    }
    setPreviousComboCount(comboCount);
  }, [comboCount, previousComboCount]);
  
  // 실시간 업데이트를 위한 useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 50); // 20fps로 부드러운 애니메이션

    return () => clearInterval(interval);
  }, []);
  
  const timeSinceLastRemove = currentTime - lastRemoveTime;
  
  // 콤보가 활성화 상태인지 확인 (2회 이상이고 3초 이내)
  const isComboActive = comboCount > 1 && lastRemoveTime > 0 && timeSinceLastRemove <= COMBO_TIME_WINDOW;
  
  // 프로그래스 바 계산: 남은 시간의 퍼센티지
  const progressPercentage = isComboActive 
    ? Math.max(0, Math.min(100, ((COMBO_TIME_WINDOW - timeSinceLastRemove) / COMBO_TIME_WINDOW) * 100))
    : 0;
  
  return (
    <div className={`combo-display ${isComboActive ? 'combo-active' : ''}`}>
      {isComboActive ? (
        <>
          <div 
            key={`combo-text-${animationKey}`}
            className="combo-text combo-level-up"
          >
            COMBO x{comboCount}
          </div>
          <div 
            className="combo-bonus"
          >
            +{comboCount - 1} 보너스!
          </div>
          <div className="combo-timer">
            <div className="combo-timer-bar">
              <div 
                className="combo-timer-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </>
      ) : (
        <div className="combo-placeholder">
          {/* 공간 유지를 위한 빈 콘텐츠 */}
        </div>
      )}
    </div>
  );
};

export default ComboDisplay;