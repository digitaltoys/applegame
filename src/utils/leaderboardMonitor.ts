// CouchDB Changes Feed를 활용한 리더보드 실시간 모니터링

import { notifyLeaderboardUpdate } from './notifications';

interface ScoreDocument {
  _id: string;
  _rev: string;
  type: string;
  name: string;
  score: number;
  createdAt: string;
}

interface LeaderboardEntry {
  key: number;
  value: {
    name: string;
    createdAt?: string;
  };
}

interface ChangeEvent {
  seq: number;
  id: string;
  changes: Array<{ rev: string }>;
  doc?: ScoreDocument;
  deleted?: boolean;
}

interface LeaderInfo {
  name: string;
  score: number;
}

class LeaderboardMonitor {
  private eventSource: EventSource | null = null;
  private currentLeader: LeaderInfo | null = null;
  private isMonitoring: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // 초기 재연결 지연 시간 (ms)
  private pollInterval: number | null = null;
  private fallbackPollingEnabled: boolean = false;

  private readonly couchDbUrl = `${import.meta.env.VITE_COUCHDB_URL}/${import.meta.env.VITE_COUCHDB_DATABASE}`;
  private readonly auth = 'Basic ' + btoa(`${import.meta.env.VITE_COUCHDB_USER}:${import.meta.env.VITE_COUCHDB_PASSWORD}`);

  constructor() {
    this.initializeCurrentLeader();
  }

  // 현재 1등 정보 초기화
  private async initializeCurrentLeader(): Promise<void> {
    try {
      const leaderboard = await this.fetchLeaderboard();
      if (leaderboard.length > 0) {
        this.currentLeader = {
          name: leaderboard[0].value.name,
          score: leaderboard[0].key
        };
        console.log('현재 1등 초기화:', this.currentLeader);
      }
    } catch (error) {
      console.error('현재 1등 정보 초기화 실패:', error);
    }
  }

  // 리더보드 데이터 가져오기
  private async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const url = `${this.couchDbUrl}/_design/scores/_view/by_score?descending=true&limit=10`;
    const response = await fetch(url, {
      headers: {
        'Authorization': this.auth,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`리더보드 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.rows || [];
  }

  // Changes Feed 모니터링 시작
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('이미 모니터링 중입니다.');
      return;
    }

    console.log('리더보드 실시간 모니터링 시작');
    this.isMonitoring = true;
    this.reconnectAttempts = 0;
    this.connectToChanges();
  }

  // Changes Feed 연결
  private connectToChanges(): void {
    try {
      // Changes Feed URL (score 타입 문서만 필터링)
      const changesUrl = `${this.couchDbUrl}/_changes?feed=eventsource&include_docs=true&filter=_view&view=scores/by_score&heartbeat=30000`;
      
      this.eventSource = new EventSource(changesUrl);

      this.eventSource.onopen = () => {
        console.log('CouchDB Changes Feed 연결됨');
        this.reconnectAttempts = 0;
        this.stopFallbackPolling(); // EventSource 연결 성공 시 폴링 중단
      };

      this.eventSource.onmessage = (event) => {
        try {
          const changeEvent: ChangeEvent = JSON.parse(event.data);
          this.handleChange(changeEvent);
        } catch (error) {
          console.error('Changes Feed 데이터 파싱 오류:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Changes Feed 연결 오류:', error);
        this.handleConnectionError();
      };

    } catch (error) {
      console.error('Changes Feed 연결 실패:', error);
      this.handleConnectionError();
    }
  }

  // 변경 이벤트 처리
  private async handleChange(changeEvent: ChangeEvent): Promise<void> {
    // 삭제된 문서나 점수 문서가 아닌 경우 무시
    if (changeEvent.deleted || !changeEvent.doc || changeEvent.doc.type !== 'score') {
      return;
    }

    console.log('점수 변경 감지:', changeEvent.doc);

    // 전체 리더보드 다시 조회하여 1등 확인
    try {
      const leaderboard = await this.fetchLeaderboard();
      if (leaderboard.length > 0) {
        const newLeader = {
          name: leaderboard[0].value.name,
          score: leaderboard[0].key
        };

        // 1등이 변경되었는지 확인
        if (this.hasLeaderChanged(newLeader)) {
          console.log('새로운 1등 감지:', newLeader);
          await notifyLeaderboardUpdate(newLeader.name, newLeader.score);
          this.currentLeader = newLeader;
        }
      }
    } catch (error) {
      console.error('리더보드 조회 중 오류:', error);
    }
  }

  // 1등 변경 여부 확인
  private hasLeaderChanged(newLeader: LeaderInfo): boolean {
    if (!this.currentLeader) {
      return true; // 이전 1등 정보가 없으면 변경된 것으로 간주
    }

    return (
      this.currentLeader.name !== newLeader.name ||
      this.currentLeader.score !== newLeader.score
    );
  }

  // 연결 오류 처리
  private handleConnectionError(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 지수 백오프
      
      console.log(`${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.isMonitoring) {
          this.connectToChanges();
        }
      }, delay);
    } else {
      console.warn('Changes Feed 최대 재연결 시도 횟수 초과, 폴링 모드로 전환');
      this.startFallbackPolling();
    }
  }

  // 폴백 폴링 시작
  private startFallbackPolling(): void {
    if (this.fallbackPollingEnabled) {
      return;
    }

    console.log('폴백 폴링 모드 시작 (30초 간격)');
    this.fallbackPollingEnabled = true;
    
    this.pollInterval = window.setInterval(async () => {
      try {
        const leaderboard = await this.fetchLeaderboard();
        if (leaderboard.length > 0) {
          const newLeader = {
            name: leaderboard[0].value.name,
            score: leaderboard[0].key
          };

          if (this.hasLeaderChanged(newLeader)) {
            console.log('폴링으로 새로운 1등 감지:', newLeader);
            await notifyLeaderboardUpdate(newLeader.name, newLeader.score);
            this.currentLeader = newLeader;
          }
        }
      } catch (error) {
        console.error('폴링 중 오류:', error);
      }
    }, 30000); // 30초마다 체크
  }

  // 폴백 폴링 중단
  private stopFallbackPolling(): void {
    if (this.pollInterval) {
      window.clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.fallbackPollingEnabled = false;
      console.log('폴백 폴링 중단');
    }
  }

  // 모니터링 중단
  public stopMonitoring(): void {
    console.log('리더보드 모니터링 중단');
    this.isMonitoring = false;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.stopFallbackPolling();
  }

  // 모니터링 상태 확인
  public isActive(): boolean {
    return this.isMonitoring;
  }

  // 현재 1등 정보 반환
  public getCurrentLeader(): LeaderInfo | null {
    return this.currentLeader;
  }
}

// 싱글톤 인스턴스
const leaderboardMonitor = new LeaderboardMonitor();

export default leaderboardMonitor;
export type { LeaderInfo };