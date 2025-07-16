# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apple Collector Game은 React + TypeScript + Vite로 구축된 웹 게임입니다. 플레이어가 1-9 숫자가 적힌 사과들을 선택하여 합이 10이 되는 조합을 만드는 퍼즐 게임입니다. PWA로 구성되어 오프라인 지원 및 모바일 설치가 가능합니다.

## Development Commands

```bash
# Development server (port 5174)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview

# Start mock JSON server (port 3001)
npm run mock:server
```

## Architecture Overview

### Core State Management
- **App.tsx**: 전체 게임 상태를 관리하는 메인 컴포넌트
- GameState: 'StartScreen' | 'Playing' | 'GameOver' 세 단계로 게임 플로우 제어
- 핵심 상태: score, timeLeft, isPaused, currentSum, gridKey (Grid 리셋용)

### Component Structure
- **Grid.tsx**: 10x10 게임 보드. 드래그 선택, 터치 지원, 사과 제거 로직
- **GameOverScreen.tsx**: 점수 저장 및 리더보드 표시
- **StartScreen.tsx**: 게임 시작 화면 및 리더보드 조회
- **Controls.tsx**: 일시정지/재시작 버튼
- **TimerBar.tsx**: 60초 카운트다운 타이머
- **ScoreBoard.tsx**, **SumDisplay.tsx**: 점수 및 현재 선택 합계 표시

### Data Persistence
이중 저장 구조로 점수 관리:
1. **로컬 저장소**: localStorage에 개인 최고점수 및 랭킹 저장
2. **원격 데이터베이스**: CouchDB (http://couchdb.ioplug.net/scoredb)에 점수 저장
   - 기본 인증: user1:any
   - 상위 10개 점수 조회: `/_design/scores/_view/by_score?descending=true&limit=10`

### PWA Configuration
- **manifest.json**: PWA 설정, 사과 아이콘 사용
- **sw.js**: Service Worker로 오프라인 캐싱
- **main.tsx**: Service Worker 등록 코드 포함

### Styling System
- **Tailwind CSS**: 주요 스타일링
- **Component CSS**: 각 컴포넌트별 전용 CSS 파일
- **Grid.css**: 사과 배경 이미지 및 반응형 디자인 포함
- 모바일 최적화: @media 쿼리로 화면 크기별 그리드 조정

### Game Logic Flow
1. **StartScreen**: 리더보드 표시 → 게임 시작
2. **Playing**: 60초 타이머 → 드래그로 사과 선택 → 합이 10이면 제거 및 점수 증가
3. **GameOver**: 점수 저장 (로컬 + 원격) → 리더보드 업데이트 → 재시작/메인메뉴

### Key Technical Details
- **드래그 시스템**: 마우스/터치 이벤트로 사각형 영역 선택
- **타이머**: useEffect + setInterval로 1초마다 감소
- **Grid 리셋**: gridKey prop 변경으로 컴포넌트 재마운트
- **상태 전파**: App.tsx에서 하위 컴포넌트로 props를 통한 상태 전달
- **에러 처리**: 네트워크 오류 시 로컬 저장만 수행

### Deployment
- Docker 설정 포함 (Dockerfile, nginx/default.conf)
- GitLab CI/CD 준비 (protected branch 설정)

## Git Work Guidelines
- 수정사항에 맞는 새로운 브랜치를 생성해서 push 작업 진행할 것