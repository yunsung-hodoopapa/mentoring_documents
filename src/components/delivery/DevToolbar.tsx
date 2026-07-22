import { useReducer } from 'react';

import {
  isLocationConsentAgreed,
  isLocationPermissionGranted,
  setLocationConsent,
  setLocationPermission,
} from './lib/fakeGeolocation';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 가짜 위치 권한/동의 상태를 토글하고 서버 데이터를 초기화하는 개발자 도구입니다.
 */

type DevToolbarProps = {
  onServerReset: () => void;
};

export function DevToolbar(props: DevToolbarProps) {
  const { onServerReset } = props;

  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const permissionGranted = isLocationPermissionGranted();
  const consentAgreed = isLocationConsentAgreed();

  const togglePermission = () => {
    setLocationPermission(!permissionGranted);
    refresh();
  };

  const toggleConsent = () => {
    setLocationConsent(!consentAgreed);
    refresh();
  };

  const handleReset = async () => {
    await fetch('/api/dev/deliveries/reset', { method: 'POST' });
    onServerReset();
  };

  return (
    <div className="delivery-dev-toolbar">
      <span className="delivery-dev-toolbar-label">개발자 도구</span>
      <button type="button" onClick={toggleConsent}>
        위치 동의: {consentAgreed ? '동의됨' : '미동의'}
      </button>
      <button type="button" onClick={togglePermission}>
        위치 권한: {permissionGranted ? '허용' : '거부'}
      </button>
      <button type="button" onClick={handleReset}>
        배달 데이터 초기화
      </button>
    </div>
  );
}
