const CACHE_NAME = 'apple-game-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/index.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭됨:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// 알림 액션 처리 (예: '게임 보기' 버튼)
self.addEventListener('notificationclick', (event) => {
  if (event.action === 'view') {
    event.notification.close();
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// 푸시 메시지 수신 처리 (향후 서버 푸시용)
self.addEventListener('push', (event) => {
  console.log('푸시 메시지 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icons/apple-icon-192x192.png',
    badge: '/icons/apple-icon-192x192.png',
    tag: 'push-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: '게임 보기',
        icon: '/icons/apple-icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Apple Collector Game', options)
  );
});