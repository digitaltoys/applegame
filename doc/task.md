# 할일 목록 (Task List)

## 0. 개발 환경 설정 및 기술 스택 확인
- [x] Vite, React, TypeScript, Tailwind CSS 기반 프론트엔드 개발 환경 설정
- [x] Zustand 라이브러리 도입 검토 및 필요시 설정 (복잡한 상태 관리용)
- [x] json-server를 이용한 백엔드 모킹 환경 구축

## 1. 게임 개요
- [x] 게임 개요 이해 및 문서화

## 2. 핵심 규칙
### 2-1. 격자(Grid)
- [x] 격자 시스템 설계
  - [x] 정사각형 셀로 이루어진 고정 크기 격자 구현 (예: 10x10)
  - [x] 각 셀에 1~9 중 하나의 숫자가 적힌 사과 아이콘 무작위 표시 기능 구현

### 2-2. 사과 선택
- [x] 사과 선택 기능 구현
  - [x] 마우스 드래그(PC) 또는 터치(모바일)로 사각형 영역 선택 기능 구현
  - [x] 선택 영역 안의 모든 사과 숫자 합계 즉시 계산 기능 구현
  - [x] 합계 정보 표시 영역에 표시 기능 구현

### 2-3. 합계 10 일치
- [x] 합계 10 일치 시 사과 제거 기능 구현
  - [x] 합이 정확히 10이면 선택된 모든 사과 사라지는 기능 구현
  - [x] 합이 10이 아니면 아무 일도 일어나지 않고 선택 초기화 기능 구현

### 2-4. 점수
- [x] 점수 시스템 구현
  - [x] 제거된 사과 1개당 1점 획득 기능 구현
  - [x] 한 번에 여러 개의 사과를 제거하면 해당 개수만큼 점수 누적 기능 구현

### 2-5. 제한 시간
- [x] 제한 시간 시스템 구현
  - [x] 기본 제한 시간 설정 (예: 60초, 변경 가능하도록)
  - [x] 시간이 0이 되면 게임 종료 기능 구현

### 2-6. 사과 리필(선택 사항)
- [ ] 사과 리필 기능 구현 (선택 사항)
  - [ ] 옵션 1: 사과 사라진 후 위에서 새로운 사과가 떨어지는 기능 구현
  - [ ] 옵션 2: 사과 사라진 후 전체 그리드를 다시 랜덤으로 채우는 기능 구현

### 2-7. 패널티(선택 사항)
- [ ] 패널티 기능 구현 (선택 사항)
  - [ ] 합이 10이 아닌 영역을 선택하면 시간을 n초 차감하는 기능 구현

## 3. 사용자 인터페이스(화면 구성)
- [x] 게임 보드 UI 구현
  - [x] 사과가 배치된 격자 표시 (셀 크기와 간격 일정)
- [x] 선택 하이라이트 UI 구현
  - [x] 사용자가 드래그한 사각 영역을 반투명 색상으로 강조 표시
- [x] 합계 표시 UI 구현
  - [x] 현재 선택된 사과들의 합을 실시간으로 정보 표시 영역 또는 선택 영역 위에 표시
- [x] 점수판 UI 구현
  - [x] 현재 점수(제거된 사과 개수) 표시
- [x] 타이머바 UI 구현
  - [x] 남은 시간 게이지 및 초 단위 숫자 표시
- [x] 재시작 / 일시정지 버튼 UI 구현
  - [x] 게임 재시작 기능 버튼
  - [x] 일시정지/재개 기능 버튼
- [x] 모바일 UI 구현
  - [x] 모바일 반응형 UI 구현(UI 세로로 배치 및 UI가 화면 밖으로 나가지 않게 위치 조정)
  - [x] 모바일 화면에서 스크롤 되지 않게 고정

## 4. 컨트롤 & 입력
- [x] 마우스 입력 처리 구현 (PC)
  - [x] 드래그로 사각형 선택 기능
- [x] 터치 입력 처리 구현 (모바일)
  - [x] 모바일에 맞게 반응형 레이아웃 적용
  - [x] 화면 스크롤 안되게 고정
  - [x] 손가락 드래그로 영역 선택 기능
- [x] 키보드 입력 처리 구현
  - [x] Esc / P 키로 일시정지 토글 기능

## 5. 게임 흐름
- [x] 게임 시작 화면 구현
  - [x] Start 버튼 클릭 시 타이머 시작 기능
- [x] 게임 플레이 루프 구현
  - [x] 제한 시간 내 사과 제거 로직
- [x] 게임 종료 화면 구현
  - [x] 시간 종료 또는 보드가 비워지면 게임 종료 화면 표시
  - [x] 점수 표시
  - [x] 최고 점수 표시
- [x] 게임 재시작/메뉴 이동 옵션 구현
  - [x] 재시작 버튼 기능
  - [x] 메인 메뉴로 이동 버튼 기능

## 6. 사운드 & 그래픽 자산
- [ ] 그래픽 자산 준비/구현
  - [ ] 빨간 사과 아이콘 (1~9 숫자 포함)
  - [ ] 선택 하이라이트 투명도 설정
- [ ] 사운드 효과 준비/구현
  - [ ] 클릭 효과음
  - [ ] 성공(합 10) 효과음
  - [ ] 실패/타임오버 음향

## 7. 확장 아이디어(후순위)
### 7-1. 레벨 시스템 구현
  - [ ] 격자 크기, 타이머 변화 등
### 7-2. 특수 사과 구현
  - [ ] 폭탄, 시간 추가 등
### 7-3. 멀티플레이
- [x] 순위 기록용 이름 입력UI 구현
- [x] 순위 기록용 이름 로컬스토리지에 저장
- [x] 이름과 점수를 couchdb에 저장
- [x] 멀티플레이 순위표 구현
### 7-4. 테마/스킨
- [ ] 테마/스킨 교체 기능 구현
### 7-5. UI/에니메이션 꾸미기
  - [ ] 드래그한 사각영역을 물방울로 표시
  - [ ] 합이 10이 되어 삭제시 물방울이 터지면서 사라지는 효과
