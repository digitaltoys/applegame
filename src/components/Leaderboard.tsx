import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import './Leaderboard.css';
import { getCurrentChannel, ensureChannel } from '../utils/channel';

interface ScoreEntry {
  id: string; // CouchDB-generated _id
  key: number; // View key (score)
  value: { // View value
    name: string;
    // createdAt can also be part of value if included in the view
    createdAt?: string;
    channel?: string; // 채널 정보 추가
  };
  // If not using a view, and fetching documents directly:
  // name?: string;
  // score?: number;
  // createdAt?: string;
}

interface LeaderboardProps {
  onClose?: () => void;
  showAsModal?: boolean; // true: 오버레이 모달, false: 인라인 표시
  autoRefresh?: boolean; // 자동 새로고침 여부
  onLeaderFetched?: (leader: { name: string; score: number } | null) => void; // 리더 정보 콜백
  selectedRule?: string; // 필터링할 게임 룰
}

export interface LeaderboardRef {
  refresh: () => Promise<void>;
}

type FilterType = 'all' | 'myGroup';

// 메모화된 테이블 컴포넌트로 불필요한 리렌더링 방지
const LeaderboardTable = React.memo<{
  filteredScores: ScoreEntry[];
  showAsModal: boolean;
}>(({ filteredScores, showAsModal }) => (
  <table className={showAsModal ? "leaderboard-table" : "leaderboard-table-inline"}>
    <thead>
      <tr>
        <th className="rank">순위</th>
        <th>이름</th>
        <th className="score">점수</th>
        <th>날짜</th>
      </tr>
    </thead>
    <tbody>
      {filteredScores.map((entry, index) => (
        <tr key={entry.id || index}>
          <td className="rank">{index + 1}</td>
          <td>{entry.value?.name || 'N/A'}</td>
          <td className="score">{Array.isArray(entry.key) ? entry.key[1] : entry.key ?? 'N/A'}</td>
          <td>{entry.value?.createdAt ? new Date(entry.value.createdAt).toLocaleDateString() : 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
));

const Leaderboard = forwardRef<LeaderboardRef, LeaderboardProps>(({ 
  onClose, 
  showAsModal = true,
  autoRefresh = false,
  onLeaderFetched,
  selectedRule
}, ref) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<string | null>(getCurrentChannel());
  const [showLoading, setShowLoading] = useState<boolean>(false);
  
  // DB에서 리더보드 데이터 조회
  const fetchLeaderboardData = useCallback(async (shouldShowLoading = true) => {
    let loadingTimer: number | null = null;
    
    if (shouldShowLoading) {
      setIsLoading(true);
      setError(null);
      // 짧은 로딩 시간에는 로딩 인디케이터를 표시하지 않음
      loadingTimer = setTimeout(() => {
        setShowLoading(true);
      }, 200);
    }
    
    // 내 친구 필터의 경우 더 많은 데이터를 가져와서 클라이언트에서 필터링
    const limit = (filter === 'myGroup' && currentChannel) ? 50 : 10;
    
    // 선택된 룰이 있으면 룰별 뷰 사용, 없으면 기본 뷰 사용
    let url: string;
    if (selectedRule) {
      // by_rule_score 뷰를 사용하여 특정 룰의 점수만 조회
      const startKey = encodeURIComponent(`["${selectedRule}",{}]`);
      const endKey = encodeURIComponent(`["${selectedRule}"]`);
      url = `http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_rule_score?startkey=${startKey}&endkey=${endKey}&descending=true&limit=${limit}`;
    } else {
      url = `http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_score?descending=true&limit=${limit}`;
    }

    try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('user1:any')}`,
          }
      });
      if (!response.ok) {
        const errorMsgText = await response.text();
        let errorDetail = "";
        try {
            const errorData = JSON.parse(errorMsgText);
            errorDetail = ` - ${errorData.reason || errorData.error || errorMsgText}`;
        } catch {
            errorDetail = ` - ${errorMsgText.substring(0, 100)}`;
        }
        throw new Error(`Failed to fetch leaderboard: ${response.status}${errorDetail}`);
      }
      const data = await response.json();
      const fetchedScores = data.rows || [];
      setScores(fetchedScores);
      
      // 리더 정보 콜백 호출
      if (onLeaderFetched) {
        const leader = fetchedScores.length > 0 
          ? { 
              name: fetchedScores[0].value?.name || '', 
              score: Array.isArray(fetchedScores[0].key) ? fetchedScores[0].key[1] : fetchedScores[0].key || 0 
            }
          : null;
        onLeaderFetched(leader);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Could not load leaderboard data. Please try again later. Error: ${errorMessage}`);
      setScores([]);
    } finally {
      if (shouldShowLoading) {
        if (loadingTimer) clearTimeout(loadingTimer);
        setIsLoading(false);
        setShowLoading(false);
      }
    }
  }, [filter, currentChannel, onLeaderFetched, selectedRule]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // autoRefresh가 활성화된 경우 주기적 새로고침
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboardData, 30000); // 30초마다
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchLeaderboardData]);

  // ref를 통해 외부에서 새로고침 호출 가능
  useImperativeHandle(ref, () => ({
    refresh: () => fetchLeaderboardData(false) // 외부 호출 시 로딩 상태 표시하지 않음
  }));
  
  // 채널이 없는데 myGroup 필터가 선택되어 있으면 all로 변경
  React.useEffect(() => {
    if (!currentChannel && filter === 'myGroup') {
      setFilter('all');
    }
  }, [currentChannel, filter]);


  // 필터링된 점수 데이터 (상위 10개만 표시)
  const filteredScores = React.useMemo(() => {
    if (filter === 'all') {
      return scores.slice(0, 10);
    } else if (filter === 'myGroup' && currentChannel) {
      return scores
        .filter(entry => entry.value?.channel === currentChannel)
        .slice(0, 10);
    }
    return scores.slice(0, 10);
  }, [scores, filter, currentChannel]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: FilterType) => {
    // 내 친구 선택시 채널이 없으면 랜덤 생성
    if (newFilter === 'myGroup' && !currentChannel) {
      const newChannel = ensureChannel();
      setCurrentChannel(newChannel);
    }
    
    setFilter(newFilter);
    // fetchLeaderboardData는 useEffect에서 filter 변경을 감지하여 자동 호출됨
  };

  // 그룹 공유 핸들러
  const handleGroupShare = () => {
    // 채널이 없으면 랜덤 생성
    let channelToShare = currentChannel;
    if (!channelToShare) {
      channelToShare = ensureChannel();
      setCurrentChannel(channelToShare);
    }
    
    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?channel=${encodeURIComponent(channelToShare || 'default')}`;
    
    if (navigator.share) {
      // 네이티브 공유 API 사용 (모바일)
      navigator.share({
        title: 'Apple Collector Game',
        text: `"${channelToShare}" 그룹에 참여해서 같이 게임해요!`,
        url: shareUrl
      }).catch(console.error);
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('그룹 링크가 클립보드에 복사되었습니다!');
      }).catch(() => {
        // 클립보드 복사 실패 시 임시 텍스트 영역 사용
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('그룹 링크가 클립보드에 복사되었습니다!');
        } catch (err) {
          console.error('클립보드 복사 실패:', err);
          alert(`그룹 링크: ${shareUrl}`);
        }
        document.body.removeChild(textArea);
      });
    }
  };


  const leaderboardContent = (
    <>
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        
        {/* 그룹 필터 버튼 - 헤더 오른쪽 (항상 표시) */}
        <div className="header-filter-buttons">
          <button 
            className={`header-filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          <button 
            className={`header-filter-button ${filter === 'myGroup' ? 'active' : ''}`}
            onClick={() => handleFilterChange('myGroup')}
            disabled={false}
            title=""
          >
            내 친구
          </button>
        </div>
      </div>

      {showLoading && <p className="leaderboard-message">Loading leaderboard...</p>}
      {error && <p className="leaderboard-message error">{error}</p>}
      {!isLoading && !error && filteredScores.length === 0 && (
        <p className="leaderboard-message">
          {filter === 'all' 
            ? '🎮 아직 게임 기록이 없습니다. 첫 번째 플레이어가 되어보세요!' 
            : `📊 "${currentChannel}" 그룹의 점수가 아직 없습니다.\n게임을 플레이해서 첫 기록을 남겨보세요!`}
        </p>
      )}
      {!showLoading && !error && filteredScores.length > 0 && (
        <LeaderboardTable 
          filteredScores={filteredScores} 
          showAsModal={showAsModal} 
        />
      )}
      
      {/* 그룹 공유 버튼 - 내 친구 필터 선택시에만 표시 */}
      {currentChannel && filter === 'myGroup' && (
        <div className="group-share-container">
          <button onClick={handleGroupShare} className="group-share-button">
            📤 그룹 링크 공유
          </button>
        </div>
      )}
      
      {showAsModal && onClose && (
        <div className="close-button-container">
          <button onClick={onClose} className="leaderboard-close-button">
            닫기
          </button>
        </div>
      )}
    </>
  );

  if (showAsModal) {
    return (
      <div className="leaderboard-overlay">
        <div className="leaderboard-container">
          {leaderboardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container-inline">
      {leaderboardContent}
    </div>
  );
});

export default Leaderboard;
