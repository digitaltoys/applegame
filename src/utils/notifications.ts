// 브라우저 알림 서비스 유틸리티

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

// 알림 권한 상태 확인
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// 알림 권한 요청
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

// 로컬 알림 표시
export const showNotification = (options: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('알림 권한이 허용되지 않았습니다.');
    return;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/icons/apple-icon-192x192.png',
    badge: options.badge || '/icons/apple-icon-192x192.png',
    tag: options.tag || 'leaderboard-update',
    requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
  });

  // 알림 클릭 시 창 포커스
  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // 5초 후 자동 닫기
  setTimeout(() => {
    notification.close();
  }, 5000);
};

// Service Worker를 통한 알림 표시 (백그라운드에서도 작동)
export const showServiceWorkerNotification = async (options: NotificationOptions): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('이 브라우저는 Service Worker를 지원하지 않습니다.');
    showNotification(options); // 일반 알림으로 대체
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const notificationOptions = {
      body: options.body,
      icon: options.icon || '/icons/apple-icon-192x192.png',
      badge: options.badge || '/icons/apple-icon-192x192.png',
      tag: options.tag || 'leaderboard-update',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '게임 보기',
          icon: '/icons/apple-icon-192x192.png'
        }
      ]
    };
    
    await registration.showNotification(options.title, notificationOptions as any);
  } catch (error) {
    console.error('Service Worker 알림 표시 실패:', error);
    showNotification(options); // 일반 알림으로 대체
  }
};

// 리더보드 1등 변경 알림
export const notifyLeaderboardUpdate = async (newLeader: string, score: number): Promise<void> => {
  // 알림 설정 확인
  const notificationEnabled = localStorage.getItem('notificationEnabled');
  if (notificationEnabled === 'false') {
    return;
  }

  const options: NotificationOptions = {
    title: '🏆 새로운 1등 등장!',
    body: `${newLeader}님이 ${score}점으로 1등을 달성했습니다!`,
    icon: '/icons/apple-icon-192x192.png',
    tag: 'leaderboard-update'
  };

  await showServiceWorkerNotification(options);
};

// 알림 설정 저장/로드
export const setNotificationEnabled = (enabled: boolean): void => {
  localStorage.setItem('notificationEnabled', enabled.toString());
};

export const getNotificationEnabled = (): boolean => {
  const setting = localStorage.getItem('notificationEnabled');
  return setting !== 'false'; // 기본값은 true
};