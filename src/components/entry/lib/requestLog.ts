/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 어떤 엔드포인트가 몇 번 호출됐는지 세어 화면에 보여주기 위한 기록기입니다.
 * 실제 서비스에서는 이 역할을 실사용자 모니터링(RUM) 도구가 합니다.
 *
 * useSyncExternalStore가 읽어가므로 스냅샷은 값이 바뀔 때만 새로 만듭니다.
 */

export type RequestLogRow = {
  path: string;
  status: number;
  count: number;
};

type Listener = () => void;

const counts = new Map<string, RequestLogRow>();
const listeners = new Set<Listener>();

let firstRequestAt: number | null = null;
let lastRequestAt: number | null = null;

let rowsSnapshot: RequestLogRow[] = [];
let totalSnapshot = 0;
let elapsedSnapshot = 0;

function rebuildSnapshots() {
  rowsSnapshot = Array.from(counts.values()).sort((a, b) => b.count - a.count);
  totalSnapshot = rowsSnapshot.reduce((total, row) => total + row.count, 0);
  elapsedSnapshot =
    firstRequestAt === null || lastRequestAt === null ? 0 : (lastRequestAt - firstRequestAt) / 1000;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function recordRequest(path: string, status: number) {
  const key = `${path} ${status}`;
  const previous = counts.get(key);

  counts.set(key, {
    path,
    status,
    count: (previous?.count ?? 0) + 1,
  });

  const now = performance.now();
  firstRequestAt ??= now;
  lastRequestAt = now;

  rebuildSnapshots();
  notify();
}

export function resetRequestLog() {
  counts.clear();
  firstRequestAt = null;
  lastRequestAt = null;
  rebuildSnapshots();
  notify();
}

export function getRequestLogRows(): RequestLogRow[] {
  return rowsSnapshot;
}

/** 첫 요청부터 마지막 요청까지 흐른 시간(초). 요청이 없으면 0. */
export function getElapsedSeconds(): number {
  return elapsedSnapshot;
}

export function getTotalCount(): number {
  return totalSnapshot;
}

export function subscribeRequestLog(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
