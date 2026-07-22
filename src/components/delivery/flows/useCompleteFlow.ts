import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import { track } from '../lib/fakeAnalytics';
import { showToast } from '../lib/fakeToast';
import {
  completeDelivery,
  DeliveryApiError,
  isLocationVerificationFailedError,
} from '../lib/deliveryApi';
import type { AlreadyDeliveredReasonSheetRef } from '../modals/AlreadyDeliveredReasonSheet';
import type { PhotoProofSheetRef } from '../modals/PhotoProofSheet';
import type { CompleteDeliveryVerification, Delivery, LocationData } from '../types';
import type { useLocationGate } from './useLocationGate';

type UseCompleteFlowParams = {
  photoProofSheetRef: RefObject<PhotoProofSheetRef | null>;
  alreadyDeliveredReasonSheetRef: RefObject<AlreadyDeliveredReasonSheetRef | null>;
  locationGate: ReturnType<typeof useLocationGate>;
  onDeliveryChanged: () => void;
};

export function useCompleteFlow(params: UseCompleteFlowParams) {
  const { photoProofSheetRef, alreadyDeliveredReasonSheetRef, locationGate, onDeliveryChanged } =
    params;

  const isRunningRef = useRef(false);
  const [runningDeliveryId, setRunningDeliveryId] = useState<number | null>(null);

  const resolveVerification = async (): Promise<CompleteDeliveryVerification | null> => {
    const outcome = await photoProofSheetRef.current?.open('complete');

    if (outcome?.type === 'submitted') {
      return { type: 'proof_photo', proofPhotoPath: outcome.uploadedPath };
    }

    if (outcome?.type === 'alreadyDelivered') {
      const reasonOutcome = await alreadyDeliveredReasonSheetRef.current?.open();
      if (reasonOutcome?.type !== 'submitted') {
        return null;
      }
      return { type: 'already_delivered', reason: reasonOutcome.reason };
    }

    return null;
  };

  const start = async (delivery: Delivery): Promise<void> => {
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    setRunningDeliveryId(delivery.id);

    try {
      let location: LocationData | null = null;
      if (delivery.dropType === 'doorstep') {
        const gate = await locationGate.ensureLocation();
        if (gate.type !== 'granted') {
          return;
        }
        location = gate.location;
      }

      let verification: CompleteDeliveryVerification | undefined;

      while (true) {
        try {
          const { deliveredAt } = await completeDelivery(delivery.id, {
            ...(location ?? {}),
            ...verification,
          });

          track('tap_delivery_complete', {
            deliveryId: delivery.id,
            dropType: delivery.dropType,
            deliveredAt,
          });
          showToast('배달을 완료했어요');
          onDeliveryChanged();
          return;
        } catch (error) {
          if (verification === undefined && isLocationVerificationFailedError(error)) {
            const resolved = await resolveVerification();
            if (!resolved) {
              return;
            }
            verification = resolved;
            continue;
          }

          if (error instanceof DeliveryApiError) {
            window.alert(`배달 완료 실패\n${error.message}`);
            return;
          }

          window.alert('배달 완료 실패\n다시 완료를 시도해주세요.');
          return;
        }
      }
    } catch {
      window.alert('배달 완료 실패\n다시 완료를 시도해주세요.');
    } finally {
      isRunningRef.current = false;
      setRunningDeliveryId(null);
    }
  };

  return { start, runningDeliveryId };
}
