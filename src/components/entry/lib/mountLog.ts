/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 컴포넌트가 몇 번 마운트됐는지 세는 기록기입니다.
 * React DevTools로는 "지금 몇 개 떠 있는지"만 보이고 "몇 번 다시 태어났는지"는 안 보입니다.
 *
 * useSyncExternalStore가 읽어가므로 스냅샷은 값이 바뀔 때만 새로 만듭니다.
 */

import { useEffect } from 'react';

export type MountCountRow = {
  name: string;
  count: number;
};

type Listener = () => void;

const mountCounts = new Map<string, number>();
const listeners = new Set<Listener>();

let snapshot: MountCountRow[] = [];

function rebuildSnapshot() {
  snapshot = Array.from(mountCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function resetMountLog() {
  mountCounts.clear();
  rebuildSnapshot();
  notify();
}

export function getMountCounts(): MountCountRow[] {
  return snapshot;
}

export function subscribeMountLog(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMountCounter(name: string) {
  useEffect(() => {
    mountCounts.set(name, (mountCounts.get(name) ?? 0) + 1);
    rebuildSnapshot();
    notify();
  }, [name]);
}
