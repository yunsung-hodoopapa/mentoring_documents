import { useRef, useState } from 'react';

import { track } from './lib/fakeAnalytics';
import { showToast } from './lib/fakeToast';
import { getCurrentLocationWithRetry } from './lib/fakeGeolocation';
import { useLocationPermissionFlow } from './lib/useLocationPermissionFlow';
import type { LocationPermissionFlowOutcome } from './lib/useLocationPermissionFlow';
import {
  completeDelivery,
  DeliveryApiError,
  isLocationVerificationFailedError,
} from './lib/deliveryApi';
import type { BottomSheetRef } from './lib/BottomSheet';
import { AlreadyDeliveredReasonSheet } from './modals/AlreadyDeliveredReasonSheet';
import { LocationConsentModal } from './modals/LocationConsentModal';
import { LocationPermissionModal } from './modals/LocationPermissionModal';
import { PhotoProofSheet } from './modals/PhotoProofSheet';
import type {
  CompleteDeliveryDto,
  CompleteDeliveryVerification,
  Delivery,
  LocationData,
  ModalRef,
} from './types';

type CompleteAttemptState = {
  locationData: LocationData | null;
};

type DeliveryCompleteButtonProps = {
  delivery: Delivery;
  onSuccessComplete?: (deliveredAt: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
};

export function DeliveryCompleteButton(props: DeliveryCompleteButtonProps) {
  const { delivery, onSuccessComplete, onLoadingChange } = props;

  const requiresLocationVerification = delivery.dropType === 'doorstep';

  const {
    isLoading: locationPermissionLoading,
    requestLocationPermission,
    acceptLocationConsent,
    requestLocationPermissionAfterConsent,
  } = useLocationPermissionFlow();

  const [isLoading, setIsLoading] = useState(false);
  const isInteractionLockedRef = useRef(false);

  const handleLoadingState = (loading: boolean): void => {
    isInteractionLockedRef.current = loading;
    setIsLoading(loading);
    onLoadingChange?.(loading);
  };

  const locationConsentModalRef = useRef<ModalRef>(null);
  const permissionDeniedModalRef = useRef<BottomSheetRef>(null);
  const photoProofSheetRef = useRef<ModalRef>(null);
  const alreadyDeliveredReasonSheetRef = useRef<ModalRef>(null);
  const isCompletingRef = useRef(false);
  const completeAttemptRef = useRef<CompleteAttemptState | null>(null);

  const resetCompleteAttempt = (): void => {
    completeAttemptRef.current = null;
  };

  const handleActualComplete = async (
    providedLocationData?: LocationData | null,
    verification?: CompleteDeliveryVerification,
  ): Promise<void> => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    let didComplete = false;
    let locationData = providedLocationData;

    try {
      handleLoadingState(true);
      if (locationData === undefined) {
        locationData = await getCurrentLocationWithRetry();
      }

      const locationPayload = locationData
        ? {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
          }
        : {};
      const dto: CompleteDeliveryDto | undefined =
        locationData || verification
          ? {
              ...locationPayload,
              ...verification,
            }
          : undefined;

      const { deliveredAt } = await completeDelivery(delivery.id, dto ?? {});
      didComplete = true;

      track('tap_delivery_complete', {
        deliveryId: delivery.id,
        dropType: delivery.dropType,
        location: locationData,
      });

      if (onSuccessComplete) {
        onSuccessComplete(deliveredAt);
      } else {
        showToast('배달을 완료했어요');
      }
    } catch (error) {
      if (
        requiresLocationVerification &&
        verification === undefined &&
        isLocationVerificationFailedError(error)
      ) {
        const attemptLocationData = locationData ?? null;
        completeAttemptRef.current = { locationData: attemptLocationData };
        photoProofSheetRef.current?.open();
      } else if (error instanceof DeliveryApiError) {
        window.alert(`배달 완료 실패\n${error.message}`);
      } else {
        const message =
          error instanceof Error ? error.message : '다시 시도해보세요. 문제가 계속되면 문의해주세요.';
        window.alert(`배달 완료 실패\n${message}`);
      }
    } finally {
      isCompletingRef.current = false;
      handleLoadingState(false);
      if (didComplete) {
        resetCompleteAttempt();
      }
    }
  };

  const performCompleteWithLocation = async (): Promise<void> => {
    const locationData = await getCurrentLocationWithRetry();
    completeAttemptRef.current = { locationData };
    await handleActualComplete(locationData);
  };

  const handleLocationPermissionOutcome = async (
    outcome: LocationPermissionFlowOutcome,
  ): Promise<void> => {
    if (outcome === 'granted') {
      await performCompleteWithLocation();
    } else if (outcome === 'consentRequired') {
      locationConsentModalRef.current?.open();
    } else if (outcome === 'permissionDenied') {
      permissionDeniedModalRef.current?.show();
    }
  };

  const handleLocationConsentDismissed = async (): Promise<void> => {
    handleLoadingState(true);
    try {
      const outcome = await requestLocationPermissionAfterConsent();
      await handleLocationPermissionOutcome(outcome);
    } catch {
      window.alert('배달 완료 실패\n다시 완료를 시도해주세요.');
    } finally {
      handleLoadingState(false);
    }
  };

  const retryCompleteWithVerification = async (
    verification: CompleteDeliveryVerification,
  ): Promise<void> => {
    if (!completeAttemptRef.current) {
      try {
        handleLoadingState(true);
        completeAttemptRef.current = {
          locationData: await getCurrentLocationWithRetry(),
        };
      } catch {
        resetCompleteAttempt();
        handleLoadingState(false);
        window.alert('배달 완료 실패\n다시 완료를 시도해주세요.');
        return;
      }
    }

    await handleActualComplete(completeAttemptRef.current.locationData, verification);
  };

  const handleProofPhotoCaptured = async (uploadedPath: string): Promise<void> => {
    await retryCompleteWithVerification({
      type: 'proof_photo',
      proofPhotoPath: uploadedPath,
    });
  };

  const handleCompleteExceptionClose = (): void => {
    resetCompleteAttempt();
    handleLoadingState(false);
  };

  const handleAlreadyDeliveredSelect = (): void => {
    alreadyDeliveredReasonSheetRef.current?.open();
  };

  const handleAlreadyDeliveredReasonSubmit = async (reason: string): Promise<void> => {
    await retryCompleteWithVerification({ type: 'already_delivered', reason });
  };

  const handleCompleteButton = async (): Promise<void> => {
    if (isInteractionLockedRef.current || locationPermissionLoading) {
      return;
    }

    handleLoadingState(true);

    if (requiresLocationVerification) {
      try {
        const outcome = await requestLocationPermission();
        await handleLocationPermissionOutcome(outcome);
      } finally {
        handleLoadingState(false);
      }
      return;
    }

    await handleActualComplete();
  };

  return (
    <>
      <button
        type="button"
        className="delivery-button-primary"
        disabled={isLoading || locationPermissionLoading}
        onClick={handleCompleteButton}
      >
        {isLoading || locationPermissionLoading ? '처리 중...' : '배달 완료'}
      </button>
      {requiresLocationVerification ? (
        <>
          <LocationConsentModal
            ref={locationConsentModalRef}
            onAgree={acceptLocationConsent}
            onAgreeDismissed={handleLocationConsentDismissed}
          />
          <LocationPermissionModal ref={permissionDeniedModalRef} />
          <PhotoProofSheet
            ref={photoProofSheetRef}
            flow="complete"
            onSubmit={handleProofPhotoCaptured}
            onClose={handleCompleteExceptionClose}
            onAlreadyDelivered={handleAlreadyDeliveredSelect}
          />
          <AlreadyDeliveredReasonSheet
            ref={alreadyDeliveredReasonSheetRef}
            onSubmit={handleAlreadyDeliveredReasonSubmit}
            onClose={handleCompleteExceptionClose}
          />
        </>
      ) : null}
    </>
  );
}
