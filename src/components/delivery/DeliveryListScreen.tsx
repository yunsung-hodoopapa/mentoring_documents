import { useCallback, useEffect, useState } from 'react';

import { DeliveryCard } from './DeliveryCard';
import { DeliveryDetailPanel } from './DeliveryDetailPanel';
import { DevToolbar } from './DevToolbar';
import { fetchDeliveries } from './lib/deliveryApi';
import type { Delivery } from './types';
import './delivery.css';

export function DeliveryListScreen() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);

  const reloadDeliveries = useCallback(async () => {
    const nextDeliveries = await fetchDeliveries();
    setDeliveries(nextDeliveries);
  }, []);

  useEffect(() => {
    void reloadDeliveries();
  }, [reloadDeliveries]);

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
              onSelect={setSelectedDeliveryId}
              onDeliveryChanged={() => void reloadDeliveries()}
            />
          ))}
        </section>
        {selectedDelivery ? (
          <DeliveryDetailPanel
            delivery={selectedDelivery}
            onClose={() => setSelectedDeliveryId(null)}
            onDeliveryChanged={() => void reloadDeliveries()}
          />
        ) : null}
      </div>
    </div>
  );
}
