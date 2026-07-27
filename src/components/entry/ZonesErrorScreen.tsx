import { useMountCounter } from './lib/mountLog';
import { useDeliveryZones } from './queries';

export function ZonesErrorScreen() {
  useMountCounter('ZonesErrorScreen');

  const { refetch, isFetching } = useDeliveryZones();

  return (
    <div className="entry-error">
      <h2>배달 구역을 불러오지 못했어요</h2>
      <p>
        서버에 일시적인 문제가 있어요. 잠시 뒤 다시 시도해 주세요. 계속 안 되면 고객센터로 문의해
        주세요.
      </p>
      <button type="button" onClick={() => void refetch()} disabled={isFetching}>
        {isFetching ? '불러오는 중…' : '다시 시도'}
      </button>
    </div>
  );
}
