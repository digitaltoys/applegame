# 사과게임 요구사항

## 1. 게임 개요
랜덤으로 배치된 1~9 숫자 사과를 클릭/드래그하여 선택한 사과들의 합이 10이 되면 해당 사과가 사라지는 퍼즐 게임입니다. 제한 시간 내에 사과를 최대한 많이 제거해 점수를 획득하는 것이 목표입니다.

## 2. 핵심 규칙
### 격자(Grid)
- 정사각형 셀로 이루어진 고정 크기 격자(예: 10×10).
- 각 셀에는 1~9 중 하나의 숫자가 적힌 사과 아이콘이 무작위로 표시됩니다.

### 사과 선택
- 마우스 드래그(PC) 또는 터치(모바일)로 사각형 영역을 선택합니다.
- 선택 영역 안의 모든 사과 숫자 합계를 즉시 계산해 정보 표시 영역에 표시합니다.

### 합계 10 일치
- 합이 정확히 10이면 선택된 모든 사과가 사라집니다.
- 합이 10이 아니면 아무 일도 일어나지 않고 선택이 초기화됩니다.

### 점수
- 제거된 사과 1개당 1점을 획득합니다.
- 한 번에 여러 개의 사과를 제거하면 해당 개수만큼 점수가 누적됩니다.

### 제한 시간
- 기본 제한 시간: 60초(변경 가능).
- 시간이 0이 되면 게임 종료.

### 사과 리필(선택 사항)
- 사과가 사라진 후, 위에서 새로운 사과가 떨어지거나 전체 그리드를 다시 랜덤으로 채울 수 있습니다.

### 패널티(선택 사항)
- 합이 10이 아닌 영역을 선택하면 시간을 n초 차감할 수 있습니다.

## 3. 사용자 인터페이스(화면 구성)
| 요소             | 설명                                                                 |
|------------------|----------------------------------------------------------------------|
| 게임 보드        | 사과가 배치된 격자. 셀 크기와 간격 일정.                                   |
| 선택 하이라이트  | 사용자가 드래그한 사각 영역을 반투명 색상으로 강조.                             |
| 합계 표시        | 현재 선택된 사과들의 합을 실시간으로 정보 표시 영역 또는 선택 영역 위에 표시.        |
| 점수판           | 현재 점수(제거된 사과 개수) 표시.                                            |
| 타이머바         | 남은 시간 게이지 및 초 단위 숫자.                                             |
| 재시작 / 일시정지 버튼 | 게임 재시작, 일시정지/재개 기능.                                           |

## 4. 컨트롤 & 입력
- 마우스(PC): 드래그로 사각형 선택, 클릭으로 단일 셀 선택.
- 터치(모바일): 손가락 드래그로 영역 선택.
- Esc / P 키: 일시정지 토글.

## 5. 게임 흐름
1. 시작 화면 → Start 클릭 → 타이머 시작.
2. 플레이어는 제한 시간 내 최대한 많은 사과를 제거.
3. 시간 종료 또는 보드가 비워지면 게임 종료 화면 표시 (점수, 최고 점수).
4. 재시작 or 메인 메뉴로 이동.

## 6. 사운드 & 그래픽 자산
- 그래픽: 빨간 사과 아이콘(1~9 숫자 포함), 선택 하이라이트 투명도.
- 사운드: 클릭, 성공(합 10) 효과음, 실패/타임오버 음향.

## 7. 기술 스택 제안
- 프론트엔드: Vite, React, TypeScript, Tailwind CSS를 핵심 기술 스택으로 사용합니다.
    - 복잡한 상태 관리가 필요할 경우, 경량 상태 관리 라이브러리는 Zustand 사용합니다.
- 백엔드: json-server를 사용합니다

## 8. 확장 아이디어(후순위)
- 레벨 시스템(격자 크기, 타이머 변화).
- 특수 사과(폭탄, 시간 추가 등).
- 멀티플레이 순위표.
- 테마/스킨 교체.

*최종 구현 전 세부 수치는 기획 단계에서 조정 가능합니다.*
