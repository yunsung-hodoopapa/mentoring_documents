/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 배달 구역 API가 500을 반환하도록 강제하는 스위치입니다.
 * 서버(MSW)와 개발자 도구가 같은 값을 읽도록 sessionStorage에 둡니다.
 *
 * 값을 바꾼 뒤에는 새로고침이 필요합니다. 왜 필요한지는 실습 미션 2에서 다룹니다.
 */

const STORAGE_KEY = 'step05:zone-outage';

export function isZoneOutageEnabled(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}

export function setZoneOutageEnabled(enabled: boolean) {
  sessionStorage.setItem(STORAGE_KEY, String(enabled));
}
