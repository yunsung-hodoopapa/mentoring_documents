import { useState } from 'react';

import {
  isLocationConsentAgreed,
  isLocationPermissionGranted,
  setLocationConsent,
} from './fakeGeolocation';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 위치 이용 동의 → 브라우저 권한 순서로 확인하는 흐름 훅입니다.
 * 모바일 앱의 위치 권한 훅과 같은 모양의 outcome을 돌려줍니다.
 */

export type LocationPermissionFlowOutcome = 'granted' | 'consentRequired' | 'permissionDenied';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useLocationPermissionFlow() {
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = async (): Promise<LocationPermissionFlowOutcome> => {
    setIsLoading(true);
    try {
      await delay(300);

      if (!isLocationConsentAgreed()) {
        return 'consentRequired';
      }
      if (!isLocationPermissionGranted()) {
        return 'permissionDenied';
      }
      return 'granted';
    } finally {
      setIsLoading(false);
    }
  };

  const acceptLocationConsent = async (): Promise<void> => {
    await delay(200);
    setLocationConsent(true);
  };

  const requestLocationPermissionAfterConsent =
    async (): Promise<LocationPermissionFlowOutcome> => {
      setIsLoading(true);
      try {
        await delay(300);

        if (!isLocationPermissionGranted()) {
          return 'permissionDenied';
        }
        return 'granted';
      } finally {
        setIsLoading(false);
      }
    };

  return {
    isLoading,
    requestLocationPermission,
    acceptLocationConsent,
    requestLocationPermissionAfterConsent,
  };
}
