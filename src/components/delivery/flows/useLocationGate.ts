import type { RefObject } from 'react';

import type { BottomSheetRef } from '../lib/BottomSheet';
import { getCurrentLocationWithRetry, setLocationConsent } from '../lib/fakeGeolocation';
import { useLocationPermissionFlow } from '../lib/useLocationPermissionFlow';
import type { LocationConsentModalRef } from '../modals/LocationConsentModal';
import type { LocationData } from '../types';

export type LocationGateResult = { type: 'granted'; location: LocationData } | { type: 'blocked' };

type UseLocationGateParams = {
  consentModalRef: RefObject<LocationConsentModalRef | null>;
  permissionModalRef: RefObject<BottomSheetRef | null>;
};

export function useLocationGate(params: UseLocationGateParams) {
  const { consentModalRef, permissionModalRef } = params;
  const { requestLocationPermission, requestLocationPermissionAfterConsent } =
    useLocationPermissionFlow();

  const ensureLocation = async (): Promise<LocationGateResult> => {
    let outcome = await requestLocationPermission();

    if (outcome === 'consentRequired') {
      const consent = await consentModalRef.current?.open();
      if (consent !== 'agreed') {
        return { type: 'blocked' };
      }
      setLocationConsent(true);
      outcome = await requestLocationPermissionAfterConsent();
    }

    if (outcome === 'permissionDenied') {
      permissionModalRef.current?.show();
      return { type: 'blocked' };
    }

    const location = await getCurrentLocationWithRetry();
    return { type: 'granted', location };
  };

  return { ensureLocation };
}
