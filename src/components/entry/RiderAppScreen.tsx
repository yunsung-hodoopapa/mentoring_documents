import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { EntryDevToolbar } from './EntryDevToolbar';
import { EntryGuard } from './EntryGuard';
import { RequestCounterPanel } from './RequestCounterPanel';
import './entry.css';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 5단계 실습의 루트. 다른 실습 탭과 캐시가 섞이지 않도록 QueryClient를 여기서 만듭니다.
 * retry는 0, staleTime은 기본값(0)입니다. 실제 서비스와 같은 설정이에요.
 */
export function RiderAppScreen() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="entry-app">
        <header className="entry-header">
          <h1>라이더 앱 진입 게이트</h1>
          <p>배달 구역을 받아야 홈으로 들어갑니다. 구역 API가 죽으면 어떻게 되는지 관찰하세요.</p>
        </header>
        <EntryDevToolbar />
        <div className="entry-layout">
          <div className="entry-stage">
            <EntryGuard />
          </div>
          <RequestCounterPanel />
        </div>
      </div>
    </QueryClientProvider>
  );
}
