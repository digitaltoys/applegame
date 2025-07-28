import React, { useState, useEffect } from 'react';
import { 
  getNotificationPermission, 
  requestNotificationPermission,
  getNotificationEnabled,
  setNotificationEnabled
} from '../utils/notifications';
import './NotificationSettings.css';

const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setIsEnabled(getNotificationEnabled());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        setNotificationEnabled(true);
        setIsEnabled(true);
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleToggleNotification = (enabled: boolean) => {
    setNotificationEnabled(enabled);
    setIsEnabled(enabled);
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: '허용됨', className: 'permission-granted' };
      case 'denied':
        return { text: '차단됨', className: 'permission-denied' };
      default:
        return { text: '미설정', className: 'permission-default' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="notification-settings">
      <h3>🔔 알림 설정</h3>
      
      <div className="permission-status">
        <span>브라우저 권한: </span>
        <span className={`status ${permissionStatus.className}`}>
          {permissionStatus.text}
        </span>
        <button
          onClick={handleRequestPermission}>설정</button>
      </div>

      {permission === 'default' && (
        <div className="permission-request">
          <p>리더보드 1등 변경 시 알림을 받으려면 권한을 허용해주세요.</p>
          <button 
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="permission-button"
          >
            {isRequesting ? '요청 중...' : '알림 권한 허용'}
          </button>
        </div>
      )}

      {permission === 'denied' && (
        <div className="permission-denied-info">
          <p>⚠️ 알림이 차단되었습니다.</p>
          <p>브라우저 설정에서 알림을 허용해주세요.</p>
          <small>
            Chrome: 주소창 왼쪽 🔒 아이콘 → 알림 → 허용<br/>
            Firefox: 주소창 왼쪽 🛡️ 아이콘 → 알림 → 허용
          </small>
        </div>
      )}

      {permission === 'granted' && (
        <div className="notification-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleToggleNotification(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              1등 변경 알림 {isEnabled ? '켜짐' : '꺼짐'}
            </span>
          </label>
        </div>
      )}

      <div className="notification-info">
        <small>
          💡 알림은 새로운 1등이 등장했을 때만 표시됩니다.
        </small>
        <br />
        <small style={{ marginTop: '8px', display: 'block' }}>
          📱 실시간 모니터링으로 다른 플레이어의 기록 갱신을 즉시 알려드립니다.
        </small>
        <br />
        <small style={{ marginTop: '8px', display: 'block' }}>
          🔋 배터리 최적화된 효율적인 알림 시스템입니다.
        </small>
      </div>
    </div>
  );
};

export default NotificationSettings;
