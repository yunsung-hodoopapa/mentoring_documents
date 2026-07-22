import { useRef, useState } from 'react';

import { track } from './lib/fakeAnalytics';
import { showToast } from './lib/fakeToast';
import { getCurrentLocationWithRetry } from './lib/fakeGeolocation';
import { useLocationPermissionFlow } from './lib/useLocationPermissionFlow';
import type { LocationPermissionFlowOutcome } from './lib/useLocationPermissionFlow';
import {
  isLateNegotiationRequiredError,
  isLocationVerificationFailedError,
  startPickup,
} from './lib/deliveryApi';
import type { BottomSheetRef } from './lib/BottomSheet';
import { LateReasonSheet } from './modals/LateReasonSheet';
import { LocationConsentModal } from './modals/LocationConsentModal';
import { LocationPermissionModal } from './modals/LocationPermissionModal';
import { PhotoProofSheet } from './modals/PhotoProofSheet';
import type { Delivery, LocationData, ModalRef, StartPickupDto } from './types';

// note: 픽업 가능 판정은 서버가 담당하며 422 응답에 필요한 사진·지연 사유를 누적해 재호출한다.

type PickupAttemptState = {
  locationData: LocationData | null;
  proofPhotoPath?: string;
  isLateNegotiated?: boolean;
};

type PickupStartButtonProps = {
  delivery: Delivery;
  onPickupStart?: (pickedUpAt: string) => void;
};

export function PickupStartButton(props: PickupStartButtonProps) {
  const { delivery, onPickupStart } = props;

  const locationConsentModalRef = useRef<ModalRef>(null);
  const permissionDeniedModalRef = useRef<BottomSheetRef>(null);
  const photoProofSheetRef = useRef<ModalRef>(null);
  const lateReasonSheetRef = useRef<ModalRef>(null);

  const isPickupRequestPendingRef = useRef(false);
  const [isPickupRequestPending, setIsPickupRequestPending] = useState(false);

  const {
    isLoading: locationLoading,
    requestLocationPermission,
    acceptLocationConsent,
    requestLocationPermissionAfterConsent,
  } = useLocationPermissionFlow();

  const [isFlowLoading, setIsFlowLoading] = useState(false);
  const pickupAttemptRef = useRef<PickupAttemptState | null>(null);

  const resetPickupFlow = (): void => {
    pickupAttemptRef.current = null;
  };

  const attemptPickup = async (): Promise<void> => {
    if (isPickupRequestPendingRef.current) {
      return;
    }

    const attempt = pickupAttemptRef.current;
    if (!attempt) {
      return;
    }

    const { locationData, proofPhotoPath, isLateNegotiated } = attempt;

    const locationPayload = locationData
      ? {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
        }
      : {};

    const dto: StartPickupDto = {
      ...locationPayload,
      ...(proofPhotoPath ? { proofPhotoPath } : {}),
      ...(isLateNegotiated !== undefined ? { isLateNegotiated } : {}),
    };

    isPickupRequestPendingRef.current = true;
    setIsPickupRequestPending(true);
    try {
      const { pickedUpAt } = await startPickup(delivery.id, dto);

      onPickupStart?.(pickedUpAt);
      track('tap_pickup_start', {
        deliveryId: delivery.id,
        location: locationPayload,
        ...(proofPhotoPath ? { proofPhotoAttached: true } : {}),
        ...(isLateNegotiated !== undefined ? { isLateNegotiated } : {}),
      });
      showToast('픽업을 시작했어요');
      resetPickupFlow();
    } catch (error) {
      if (proofPhotoPath === undefined && isLocationVerificationFailedError(error)) {
        photoProofSheetRef.current?.open();
        return;
      }

      if (isLateNegotiated === undefined && isLateNegotiationRequiredError(error)) {
        lateReasonSheetRef.current?.open();
        return;
      }

      resetPickupFlow();
      window.alert('문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      isPickupRequestPendingRef.current = false;
      setIsPickupRequestPending(false);
    }
  };

  const performPickup = async (): Promise<void> => {
    try {
      setIsFlowLoading(true);

      const locationData = await getCurrentLocationWithRetry();
      pickupAttemptRef.current = { locationData };

      await attemptPickup();
    } finally {
      setIsFlowLoading(false);
    }
  };

  const handleLocationPermissionOutcome = async (
    outcome: LocationPermissionFlowOutcome,
  ): Promise<void> => {
    if (outcome === 'granted') {
      await performPickup();
    } else if (outcome === 'consentRequired') {
      locationConsentModalRef.current?.open();
    } else if (outcome === 'permissionDenied') {
      permissionDeniedModalRef.current?.show();
    }
  };

  const handleStartPickup = async () => {
    if (isPickupRequestPendingRef.current || locationLoading || isFlowLoading) {
      return;
    }

    try {
      setIsFlowLoading(true);
      const outcome = await requestLocationPermission();
      await handleLocationPermissionOutcome(outcome);
    } catch {
      window.alert('픽업 시작 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsFlowLoading(false);
    }
  };

  const handleLocationConsentDismissed = async (): Promise<void> => {
    setIsFlowLoading(true);
    try {
      const outcome = await requestLocationPermissionAfterConsent();
      await handleLocationPermissionOutcome(outcome);
    } catch {
      window.alert('픽업 시작 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsFlowLoading(false);
    }
  };

  const handleProofPhotoCaptured = async (uploadedPath: string): Promise<void> => {
    try {
      setIsFlowLoading(true);

      if (!pickupAttemptRef.current) {
        pickupAttemptRef.current = { locationData: await getCurrentLocationWithRetry() };
      }

      pickupAttemptRef.current.proofPhotoPath = uploadedPath;
      await attemptPickup();
    } catch {
      resetPickupFlow();
      window.alert('문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIsFlowLoading(false);
    }
  };

  const handleProofSheetClose = (): void => {
    resetPickupFlow();
  };

  const handleLateReasonSelect = async (isLateNegotiated: boolean): Promise<void> => {
    const attempt = pickupAttemptRef.current;
    if (!attempt) {
      return;
    }

    try {
      setIsFlowLoading(true);
      attempt.isLateNegotiated = isLateNegotiated;
      await attemptPickup();
    } finally {
      setIsFlowLoading(false);
    }
  };

  const handleLateReasonClose = (): void => {
    resetPickupFlow();
  };

  const isLoading = isPickupRequestPending || locationLoading || isFlowLoading;

  return (
    <>
      <button
        type="button"
        className="delivery-button-primary"
        disabled={isLoading}
        onClick={handleStartPickup}
      >
        {isLoading ? '처리 중...' : '픽업 시작'}
      </button>
      <LocationConsentModal
        ref={locationConsentModalRef}
        onAgree={acceptLocationConsent}
        onAgreeDismissed={handleLocationConsentDismissed}
      />
      <LocationPermissionModal ref={permissionDeniedModalRef} />
      <PhotoProofSheet
        ref={photoProofSheetRef}
        flow="pickup"
        onSubmit={handleProofPhotoCaptured}
        onClose={handleProofSheetClose}
      />
      <LateReasonSheet
        ref={lateReasonSheetRef}
        onSelect={handleLateReasonSelect}
        onClose={handleLateReasonClose}
      />
    </>
  );
}
