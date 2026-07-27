import { useReducer } from 'react';

import { resetMountLog } from './lib/mountLog';
import { resetRequestLog } from './lib/requestLog';
import { isZoneOutageEnabled, setZoneOutageEnabled } from './lib/zoneOutage';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 */
export function EntryDevToolbar() {
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const outageEnabled = isZoneOutageEnabled();

  const toggleOutage = () => {
    setZoneOutageEnabled(!outageEnabled);
    refresh();
  };

  const resetCounters = () => {
    resetRequestLog();
    resetMountLog();
    refresh();
  };

  return (
    <div className="entry-dev-toolbar">
      <span className="entry-dev-toolbar-label">개발자 도구</span>
      <button type="button" onClick={toggleOutage}>
        구역 API 500: {outageEnabled ? '켜짐' : '꺼짐'}
      </button>
      <button type="button" onClick={() => window.location.reload()}>
        새로고침
      </button>
      <button type="button" onClick={resetCounters}>
        카운터 초기화
      </button>
      <span className="entry-dev-toolbar-hint">
        500 스위치는 새로고침해야 적용돼요. 왜 그런지는 미션 2에서 다뤄요.
      </span>
    </div>
  );
}
