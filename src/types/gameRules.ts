// 게임 룰 타입 정의
export type GameRule = 'classic' | 'speed' | 'challenge';

// 룰별 설정
export const GAME_RULES = {
  classic: {
    name: '클래식',
    description: '기본 60초, 합이 10이 되는 조합을 찾아 제거',
    timeLimit: 60,
    targetSum: 10,
    tag: 'classic',
    enableCombo: false,
    enableAppleBonus: false
  },
  speed: {
    name: '스피드',
    description: '60초 콤보 모드, 연속 제거로 보너스 점수 획득',
    timeLimit: 60,
    targetSum: 10,
    tag: 'speed',
    enableCombo: true,
    enableAppleBonus: false
  },
  challenge: {
    name: '챌린지',
    description: '90초, 합이 15가 되는 조합을 찾아 제거 (4개 이상시 보너스)',
    timeLimit: 90,
    targetSum: 15,
    tag: 'challenge',
    enableCombo: false,
    enableAppleBonus: true
  }
};