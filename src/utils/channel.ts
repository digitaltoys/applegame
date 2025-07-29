// 채널 관리 유틸리티

// 쿼리스트링에서 채널값 추출
export const getChannelFromQuery = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('channel');
};

// 로컬스토리지에 채널값 저장
export const saveChannelToLocal = (channel: string): void => {
  localStorage.setItem('gameChannel', channel);
};

// 로컬스토리지에서 채널값 조회
export const getChannelFromLocal = (): string | null => {
  return localStorage.getItem('gameChannel');
};

// 현재 채널 값 반환 (쿼리스트링 우선, 없으면 로컬스토리지)
export const getCurrentChannel = (): string | null => {
  const queryChannel = getChannelFromQuery();
  if (queryChannel) {
    // 쿼리스트링에 채널이 있으면 로컬스토리지에 저장
    saveChannelToLocal(queryChannel);
    
    // 쿼리스트링 제거한 깔끔한 URL로 리다이렉트
    removeChannelFromUrl();
    
    return queryChannel;
  }
  
  // 쿼리스트링에 없으면 로컬스토리지에서 조회
  return getChannelFromLocal();
};

// URL에서 채널 쿼리스트링 제거
export const removeChannelFromUrl = (): void => {
  const url = new URL(window.location.href);
  const hasChannel = url.searchParams.has('channel');
  
  if (hasChannel) {
    url.searchParams.delete('channel');
    
    // 다른 쿼리 파라미터가 있는지 확인
    const cleanUrl = url.searchParams.toString() 
      ? `${url.pathname}?${url.searchParams.toString()}`
      : url.pathname;
    
    // history.replaceState로 페이지 새로고침 없이 URL 변경
    window.history.replaceState({}, document.title, cleanUrl);
    console.log('채널 쿼리스트링 제거됨:', cleanUrl);
  }
};

// 랜덤 채널 생성 (8자 영숫자)
export const generateRandomChannel = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// 채널이 없을 때 랜덤 채널 생성 및 저장
export const ensureChannel = (): string => {
  const existingChannel = getCurrentChannel();
  if (existingChannel) {
    return existingChannel;
  }
  
  const newChannel = generateRandomChannel();
  saveChannelToLocal(newChannel);
  console.log('새로운 채널 생성됨:', newChannel);
  return newChannel;
};

// 채널값 초기화 (앱 시작 시 호출)
export const initializeChannel = (): string | null => {
  const channel = getCurrentChannel();
  console.log('초기화된 채널:', channel);
  return channel;
};