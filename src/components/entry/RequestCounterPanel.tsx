import { useSyncExternalStore } from 'react';

import { getMountCounts, subscribeMountLog } from './lib/mountLog';
import {
  getElapsedSeconds,
  getRequestLogRows,
  getTotalCount,
  subscribeRequestLog,
} from './lib/requestLog';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 실제 서비스에서 실사용자 모니터링(RUM) 대시보드로 보던 표를 화면 안에 옮겨둔 것입니다.
 */
export function RequestCounterPanel() {
  const rows = useSyncExternalStore(subscribeRequestLog, getRequestLogRows);
  const total = useSyncExternalStore(subscribeRequestLog, getTotalCount);
  const elapsed = useSyncExternalStore(subscribeRequestLog, getElapsedSeconds);
  const mounts = useSyncExternalStore(subscribeMountLog, getMountCounts);

  const perSecond = elapsed > 0 ? (total / elapsed).toFixed(1) : '—';

  return (
    <aside className="entry-counter">
      <h3>요청 카운터</h3>
      <p className="entry-counter-summary">
        총 <strong>{total}</strong>건 · {elapsed.toFixed(1)}초 · 초당 <strong>{perSecond}</strong>건
      </p>

      <table className="entry-counter-table">
        <thead>
          <tr>
            <th>엔드포인트</th>
            <th>응답</th>
            <th>건수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.path} ${row.status}`}>
              <td>{row.path.replace('/api/rider', '')}</td>
              <td className={row.status >= 500 ? 'entry-counter-error' : undefined}>{row.status}</td>
              <td>{row.count}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3}>아직 요청이 없어요.</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <h3>마운트 횟수</h3>
      <table className="entry-counter-table">
        <tbody>
          {mounts.map((mount) => (
            <tr key={mount.name}>
              <td>{mount.name}</td>
              <td>{mount.count}</td>
            </tr>
          ))}
          {mounts.length === 0 ? (
            <tr>
              <td colSpan={2}>아직 마운트 기록이 없어요.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </aside>
  );
}
