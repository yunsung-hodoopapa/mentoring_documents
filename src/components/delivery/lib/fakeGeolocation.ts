import type { LocationData } from '../types';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 실제 브라우저 Geolocation 대신 쓰는 가짜 위치 유틸입니다.
 * 권한/동의 상태는 localStorage에 저장되고, 화면 상단 개발자 도구에서 토글합니다.
 */

const LOCATION_PERMISSION_KEY = 'delivery-exercise/location-permission';
const LOCATION_CONSENT_KEY = 'delivery-exercise/location-consent';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isLocationPermissionGranted(): boolean {
  return localStorage.getItem(LOCATION_PERMISSION_KEY) !== 'denied';
}

export function setLocationPermission(granted: boolean): void {
  localStorage.setItem(LOCATION_PERMISSION_KEY, granted ? 'granted' : 'denied');
}

export function isLocationConsentAgreed(): boolean {
  return localStorage.getItem(LOCATION_CONSENT_KEY) === 'agreed';
}

export function setLocationConsent(agreed: boolean): void {
  if (agreed) {
    localStorage.setItem(LOCATION_CONSENT_KEY, 'agreed');
  } else {
    localStorage.removeItem(LOCATION_CONSENT_KEY);
  }
}

export async function getCurrentLocationWithRetry(): Promise<LocationData> {
  await delay(600);

  if (!isLocationPermissionGranted()) {
    throw new Error('위치 권한이 없습니다.');
  }

  return {
    latitude: 37.5445,
    longitude: 127.0561,
    accuracy: 12,
  };
}
