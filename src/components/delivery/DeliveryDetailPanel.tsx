import type { Delivery } from './types';

type DeliveryDetailPanelProps = {
  delivery: Delivery;
  processingDeliveryId: number | null;
  onClose: () => void;
  onStartPickup: (delivery: Delivery) => void;
  onCompleteDelivery: (delivery: Delivery) => void;
};

export function DeliveryDetailPanel(props: DeliveryDetailPanelProps) {
  const { delivery, processingDeliveryId, onClose, onStartPickup, onCompleteDelivery } = props;

  const isProcessing = processingDeliveryId === delivery.id;
  const isFlowBusy = processingDeliveryId !== null;

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
          <button
            type="button"
            className="delivery-button-primary"
            disabled={isFlowBusy}
            onClick={() => onStartPickup(delivery)}
          >
            픽업 시작
          </button>
        ) : null}
        {delivery.status === 'pickedUp' ? (
          <button
            type="button"
            className="delivery-button-primary"
            disabled={isFlowBusy}
            onClick={() => onCompleteDelivery(delivery)}
          >
            배달 완료
          </button>
        ) : null}
        {delivery.status === 'delivered' ? <p>배달이 완료된 건이에요.</p> : null}
      </div>
    </aside>
  );
}
