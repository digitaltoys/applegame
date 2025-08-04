import React from 'react';
import './StartScreen.css';
import NotificationSettings from './NotificationSettings';
import Leaderboard from './Leaderboard';
import { type GameRule, GAME_RULES } from '../types/gameRules';

interface StartScreenProps {
  onStartGame: () => void;
  selectedRule: GameRule;
  onRuleChange: (rule: GameRule) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, selectedRule, onRuleChange }) => {

  return (
    <div className="start-screen">
      <h1>Apple Collector Game</h1>
      
      {/* 룰 선택 섹션 */}
      <div className="rule-selection">
        <h2>게임 룰 선택</h2>
        <div className="rule-options">
          {(Object.keys(GAME_RULES) as GameRule[]).map((ruleKey) => {
            const rule = GAME_RULES[ruleKey];
            return (
              <div 
                key={ruleKey}
                className={`rule-option ${selectedRule === ruleKey ? 'selected' : ''}`}
                onClick={() => onRuleChange(ruleKey)}
              >
                <h3>{rule.name}</h3>
                <p>{rule.description}</p>
                <div className="rule-details">
                  <span>⏱️ {rule.timeLimit}초</span>
                  <span>🎯 합계: {rule.targetSum}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <button onClick={onStartGame} className="start-button">
        {GAME_RULES[selectedRule].name} 시작
      </button>

      <Leaderboard 
        showAsModal={false}
        selectedRule={selectedRule}
      />
      
      <NotificationSettings />
    </div>
  );
};

export default StartScreen;
