import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import { track } from '../lib/fakeAnalytics';
import { showToast } from '../lib/fakeToast';
import {
  isLateNegotiationRequiredError,
  isLocationVerificationFailedError,
  startPickup,
} from '../lib/deliveryApi';
import type { LateReasonSheetRef } from '../modals/LateReasonSheet';
import type { PhotoProofSheetRef } from '../modals/PhotoProofSheet';
import type { Delivery, StartPickupDto } from '../types';
import type { useLocationGate } from './useLocationGate';

type UsePickupFlowParams = {
  photoProofSheetRef: RefObject<PhotoProofSheetRef | null>;
  lateReasonSheetRef: RefObject<LateReasonSheetRef | null>;
  locationGate: ReturnType<typeof useLocationGate>;
  onDeliveryChanged: () => void;
};

export function usePickupFlow(params: UsePickupFlowParams) {
  const { photoProofSheetRef, lateReasonSheetRef, locationGate, onDeliveryChanged } = params;

  const isRunningRef = useRef(false);
  const [runningDeliveryId, setRunningDeliveryId] = useState<number | null>(null);

  const start = async (delivery: Delivery): Promise<void> => {
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    setRunningDeliveryId(delivery.id);

    try {
      const gate = await locationGate.ensureLocation();
      if (gate.type !== 'granted') {
        return;
      }

      const attempt: StartPickupDto = { ...gate.location };

      while (true) {
        try {
          const { pickedUpAt } = await startPickup(delivery.id, attempt);

          track('tap_pickup_start', {
            deliveryId: delivery.id,
            pickedUpAt,
            ...(attempt.proofPhotoPath ? { proofPhotoAttached: true } : {}),
            ...(attempt.isLateNegotiated !== undefined
              ? { isLateNegotiated: attempt.isLateNegotiated }
              : {}),
          });
          showToast('픽업을 시작했어요');
          onDeliveryChanged();
          return;
        } catch (error) {
          if (attempt.proofPhotoPath === undefined && isLocationVerificationFailedError(error)) {
            const outcome = await photoProofSheetRef.current?.open('pickup');
            if (outcome?.type !== 'submitted') {
              return;
            }
            attempt.proofPhotoPath = outcome.uploadedPath;
            continue;
          }

          if (attempt.isLateNegotiated === undefined && isLateNegotiationRequiredError(error)) {
            const outcome = await lateReasonSheetRef.current?.open();
            if (outcome?.type !== 'selected') {
              return;
            }
            attempt.isLateNegotiated = outcome.isLateNegotiated;
            continue;
          }

          window.alert('문제가 발생했어요. 다시 시도해주세요.');
          return;
        }
      }
    } catch {
      window.alert('픽업 시작 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      isRunningRef.current = false;
      setRunningDeliveryId(null);
    }
  };

  return { start, runningDeliveryId };
}
