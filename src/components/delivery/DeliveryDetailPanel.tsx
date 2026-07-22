import { useState } from 'react';

import { DeliveryCompleteButton } from './DeliveryCompleteButton';
import { PickupStartButton } from './PickupStartButton';
import type { Delivery } from './types';

type DeliveryDetailPanelProps = {
  delivery: Delivery;
  onClose: () => void;
  onDeliveryChanged: () => void;
};

export function DeliveryDetailPanel(props: DeliveryDetailPanelProps) {
  const { delivery, onClose, onDeliveryChanged } = props;
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <aside className="delivery-detail-panel">
      <div className="delivery-detail-header">
        <h2>배달 상세</h2>
        <button type="button" className="delivery-detail-close" onClick={onClose}>
          닫기
        </button>
      </div>
      <dl className="delivery-detail-fields">
        <div>
          <dt>고객</dt>
          <dd>{delivery.customerName}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>{delivery.address}</dd>
        </div>
        <div>
          <dt>주문</dt>
          <dd>{delivery.menuSummary}</dd>
        </div>
        <div>
          <dt>전달 방식</dt>
          <dd>{delivery.dropType === 'doorstep' ? '문 앞 전달' : '직접 전달'}</dd>
        </div>
        {delivery.pickedUpAt ? (
          <div>
            <dt>픽업 시각</dt>
            <dd>{new Date(delivery.pickedUpAt).toLocaleTimeString()}</dd>
          </div>
        ) : null}
      </dl>
      {isProcessing ? <p className="delivery-detail-processing">처리 중...</p> : null}
      <div className="delivery-detail-actions">
        {delivery.status === 'ready' ? (
          <PickupStartButton delivery={delivery} onPickupStart={onDeliveryChanged} />
        ) : null}
        {delivery.status === 'pickedUp' ? (
          <DeliveryCompleteButton
            delivery={delivery}
            onSuccessComplete={onDeliveryChanged}
            onLoadingChange={setIsProcessing}
          />
        ) : null}
        {delivery.status === 'delivered' ? <p>배달이 완료된 건이에요.</p> : null}
      </div>
    </aside>
  );
}
