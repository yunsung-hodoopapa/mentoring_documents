import { useReducer } from 'react';

import { resetMountLog } from './lib/mountLog';
import { isOutageEnabled, setOutageEnabled } from './lib/outage';
import { resetRequestLog } from './lib/requestLog';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 */
export function EntryDevToolbar() {
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const zoneOutage = isOutageEnabled('zones');
  const settingsOutage = isOutageEnabled('settings');

  const resetCounters = () => {
    resetRequestLog();
    resetMountLog();
    refresh();
  };

  return (
    <div className="entry-dev-toolbar">
      <span className="entry-dev-toolbar-label">개발자 도구</span>
      <button
        type="button"
        onClick={() => {
          setOutageEnabled('zones', !zoneOutage);
          refresh();
        }}
      >
        구역 API 500: {zoneOutage ? '켜짐' : '꺼짐'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOutageEnabled('settings', !settingsOutage);
          refresh();
        }}
      >
        설정 API 500: {settingsOutage ? '켜짐' : '꺼짐'}
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
