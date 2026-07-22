import { DeliveryCompleteButton } from './DeliveryCompleteButton';
import { PickupStartButton } from './PickupStartButton';
import type { Delivery } from './types';

const STATUS_LABEL: Record<Delivery['status'], string> = {
  ready: '픽업 대기',
  pickedUp: '배달 중',
  delivered: '배달 완료',
};

type DeliveryCardProps = {
  delivery: Delivery;
  isSelected: boolean;
  onSelect: (deliveryId: number) => void;
  onDeliveryChanged: () => void;
};

export function DeliveryCard(props: DeliveryCardProps) {
  const { delivery, isSelected, onSelect, onDeliveryChanged } = props;

  return (
    <article className={isSelected ? 'delivery-card delivery-card-selected' : 'delivery-card'}>
      <button type="button" className="delivery-card-info" onClick={() => onSelect(delivery.id)}>
        <div className="delivery-card-top">
          <strong>{delivery.customerName}</strong>
          <span className={`delivery-status delivery-status-${delivery.status}`}>
            {STATUS_LABEL[delivery.status]}
          </span>
        </div>
        <p>{delivery.address}</p>
        <p className="delivery-menu">{delivery.menuSummary}</p>
        <p className="delivery-drop-type">
          {delivery.dropType === 'doorstep' ? '문 앞 전달' : '직접 전달'}
        </p>
      </button>
      <div className="delivery-card-actions">
        {delivery.status === 'ready' ? (
          <PickupStartButton delivery={delivery} onPickupStart={onDeliveryChanged} />
        ) : null}
        {delivery.status === 'pickedUp' ? (
          <DeliveryCompleteButton delivery={delivery} onSuccessComplete={onDeliveryChanged} />
        ) : null}
      </div>
    </article>
  );
}
