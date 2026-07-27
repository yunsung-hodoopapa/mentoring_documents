import { EntryStatus } from './entryShellPolicy';
import { hasLoadFailed } from './lib/hasLoadFailed';
import { useDeliveryZones, useRiderProfile } from './queries';

/**
 * 라이더가 앱에 들어갈 수 있는 상태인지 판정합니다.
 *
 * 프로필과 배달 구역이 모두 있어야 홈으로 들어갑니다.
 */
export function useEntryStatus(): EntryStatus {
  const profileQuery = useRiderProfile();
  const zonesQuery = useDeliveryZones();

  const { data: profile, isLoading: profileLoading } = profileQuery;
  const { data: zones, isLoading: zonesLoading } = zonesQuery;

  if (profileLoading || !profile) {
    return EntryStatus.Loading;
  }

  // 실패 이력이 있으면 재요청 중이어도 Loading 으로 되돌리지 않습니다.
  // 되돌리면 스플래시로 내려가 홈이 언마운트되고, 재마운트가 다시 요청을 부릅니다.
  if (zonesLoading && !hasLoadFailed(zonesQuery)) {
    return EntryStatus.Loading;
  }

  if (!zones || zones.length === 0) {
    return EntryStatus.NoZones;
  }

  return EntryStatus.Ready;
}
