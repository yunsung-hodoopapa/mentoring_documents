import { useCallback, useEffect, useRef, useState } from 'react';

import { DeliveryCard } from './DeliveryCard';
import { DeliveryDetailPanel } from './DeliveryDetailPanel';
import { DevToolbar } from './DevToolbar';
import { useCompleteFlow } from './flows/useCompleteFlow';
import { useLocationGate } from './flows/useLocationGate';
import { usePickupFlow } from './flows/usePickupFlow';
import { fetchDeliveries } from './lib/deliveryApi';
import type { BottomSheetRef } from './lib/BottomSheet';
import { AlreadyDeliveredReasonSheet } from './modals/AlreadyDeliveredReasonSheet';
import type { AlreadyDeliveredReasonSheetRef } from './modals/AlreadyDeliveredReasonSheet';
import { LateReasonSheet } from './modals/LateReasonSheet';
import type { LateReasonSheetRef } from './modals/LateReasonSheet';
import { LocationConsentModal } from './modals/LocationConsentModal';
import type { LocationConsentModalRef } from './modals/LocationConsentModal';
import { LocationPermissionModal } from './modals/LocationPermissionModal';
import { PhotoProofSheet } from './modals/PhotoProofSheet';
import type { PhotoProofSheetRef } from './modals/PhotoProofSheet';
import type { Delivery } from './types';
import './delivery.css';

export function DeliveryListScreen() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);

  const consentModalRef = useRef<LocationConsentModalRef>(null);
  const permissionModalRef = useRef<BottomSheetRef>(null);
  const photoProofSheetRef = useRef<PhotoProofSheetRef>(null);
  const lateReasonSheetRef = useRef<LateReasonSheetRef>(null);
  const alreadyDeliveredReasonSheetRef = useRef<AlreadyDeliveredReasonSheetRef>(null);

  const reloadDeliveries = useCallback(async () => {
    const nextDeliveries = await fetchDeliveries();
    setDeliveries(nextDeliveries);
  }, []);

  useEffect(() => {
    void reloadDeliveries();
  }, [reloadDeliveries]);

  const locationGate = useLocationGate({ consentModalRef, permissionModalRef });
  const pickupFlow = usePickupFlow({
    photoProofSheetRef,
    lateReasonSheetRef,
    locationGate,
    onDeliveryChanged: () => void reloadDeliveries(),
  });
  const completeFlow = useCompleteFlow({
    photoProofSheetRef,
    alreadyDeliveredReasonSheetRef,
    locationGate,
    onDeliveryChanged: () => void reloadDeliveries(),
  });

  const processingDeliveryId = pickupFlow.runningDeliveryId ?? completeFlow.runningDeliveryId;
  const selectedDelivery = deliveries.find((delivery) => delivery.id === selectedDeliveryId);

  return (
    <div className="delivery-app">
      <header className="delivery-header">
        <h1>오늘의 배달</h1>
        <p>카드를 누르면 상세가 열려요. 상세가 열린 상태에서도 목록 버튼은 그대로 동작해요.</p>
      </header>
      <DevToolbar onServerReset={() => void reloadDeliveries()} />
      <div className="delivery-layout">
        <section className="delivery-list">
          {deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              isSelected={delivery.id === selectedDeliveryId}
              processingDeliveryId={processingDeliveryId}
              onSelect={setSelectedDeliveryId}
              onStartPickup={(target) => void pickupFlow.start(target)}
              onCompleteDelivery={(target) => void completeFlow.start(target)}
            />
          ))}
        </section>
        {selectedDelivery ? (
          <DeliveryDetailPanel
            delivery={selectedDelivery}
            processingDeliveryId={processingDeliveryId}
            onClose={() => setSelectedDeliveryId(null)}
            onStartPickup={(target) => void pickupFlow.start(target)}
            onCompleteDelivery={(target) => void completeFlow.start(target)}
          />
        ) : null}
      </div>

      <LocationConsentModal ref={consentModalRef} />
      <LocationPermissionModal ref={permissionModalRef} />
      <PhotoProofSheet ref={photoProofSheetRef} />
      <LateReasonSheet ref={lateReasonSheetRef} />
      <AlreadyDeliveredReasonSheet ref={alreadyDeliveredReasonSheetRef} />
    </div>
  );
}
