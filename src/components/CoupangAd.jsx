// CoupangAd.js
import { useEffect, useRef } from "react";

// export const CoupangAd2 = function() {
//       // console.log("✅ 쿠팡");
//       return (
//         <div style={{
//           background: 'red', 
//           color: 'white', 
//           padding: '20px', 
//           margin: '10px',
//           fontSize: '20px',
//           textAlign: 'center'
//         }}>
//           aaaaaaa
//         </div>
//       );
// }

export function CoupangAd() {
  const adRef = useRef(null);
  console.log("✅ 쿠팡");

  useEffect(() => {
    // DOM 이동 함수 (강화된 버전)
    const moveAdToContainer = () => {
      let attempts = 0;
      const maxAttempts = 10;

      const findAndMove = () => {
        attempts++;
        console.log(`🔍 쿠팡 광고 검색 시도 ${attempts}/${maxAttempts}`);

        // 더 넓은 범위로 쿠팡 광고 요소 검색
        const selectors = [
          '[id*="coupang"]',
          '[class*="coupang"]',
          'iframe[src*="coupang"]',
          'div[style*="coupang"]',
          // 쿠팡 스크립트가 생성하는 일반적인 구조들
          'body > div:not(#root)',
          'body > iframe:not([src*="localhost"])'
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(ad => {
            // root와 같은 레벨(body의 직계 자식)에 있는 요소들 확인
            if (ad.parentNode === document.body && ad.id !== 'root' && adRef.current) {
              console.log("🔄 요소를 컨테이너로 이동:", ad);
              adRef.current.appendChild(ad);

              // 이동한 요소에 추가 스타일 적용
              ad.style.maxWidth = '100%';
              ad.style.width = '100%';
              ad.style.boxSizing = 'border-box';
            }
          });
        });

        // 아직 요소를 못찾았고 시도 횟수가 남았다면 재시도
        if (attempts < maxAttempts) {
          setTimeout(findAndMove, 500);
        }
      };

      // 즉시 실행 + 지연 실행 조합
      findAndMove();
    };

    // MutationObserver로 body에 새 요소 추가 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            // body에 직접 추가된 요소 중 root가 아닌 것들
            if (node.nodeType === Node.ELEMENT_NODE &&
              node.parentNode === document.body &&
              node.id !== 'root' &&
              adRef.current) {
              console.log("🚨 새로운 요소 감지, 컨테이너로 이동:", node);
              adRef.current.appendChild(node);

              // 스타일 적용
              node.style.maxWidth = '100%';
              node.style.width = '100%';
              node.style.boxSizing = 'border-box';
            }
          });
        }
      });
    });

    // body의 직계 자식 변화 감지 시작
    observer.observe(document.body, {
      childList: true,
      subtree: false
    });

    // 이미 스크립트가 로드되었는지 확인
    if (window.PartnersCoupang || document.querySelector('script[src="https://ads-partners.coupang.com/g.js"]')) {
      console.log("✅ 쿠팡 스크립트 이미 로드됨");
      if (window.PartnersCoupang) {
        // 스크립트가 이미 있으면 바로 광고 생성
        new window.PartnersCoupang.G({
          id: 898377,
          template: "carousel",
          trackingCode: "AF1491932",
          width: "100%",
          height: "60",
          tsource: "",
          target: adRef.current
        });
        moveAdToContainer(); // 백업 이동
      }
      return;
    }

    // 1. g.js 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://ads-partners.coupang.com/g.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ 쿠팡 스크립트 로드됨 (첫 번째)");
      console.log("window.PartnersCoupang:", window.PartnersCoupang);
      // 2. 광고 생성
      new window.PartnersCoupang.G({
        id: 898377,
        template: "carousel",
        trackingCode: "AF1491932",
        width: "100%",
        height: "60",
        tsource: "",
        target: adRef.current
      });
      moveAdToContainer(); // 백업 이동
    };

    script.onerror = () => {
      console.error("❌ 쿠팡 스크립트 로드 실패");
    };

    adRef.current.appendChild(script);

    // cleanup function
    return () => {
      observer.disconnect();
    };
  }, []);

  return <div ref={adRef} style={{
  }}></div>;
}

export default { CoupangAd };