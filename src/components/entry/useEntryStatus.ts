import { EntryStatus } from './entryShellPolicy';
import { useDeliveryZones, useRiderProfile } from './queries';

/**
 * 라이더가 앱에 들어갈 수 있는 상태인지 판정합니다.
 *
 * 프로필과 배달 구역이 모두 있어야 홈으로 들어갑니다.
 */
export function useEntryStatus(): EntryStatus {
  const { data: profile, isLoading: profileLoading } = useRiderProfile();
  const { data: zones, isLoading: zonesLoading } = useDeliveryZones();

  if (profileLoading || !profile) {
    return EntryStatus.Loading;
  }

  if (zonesLoading) {
    return EntryStatus.Loading;
  }

  if (!zones || zones.length === 0) {
    return EntryStatus.NoZones;
  }

  return EntryStatus.Ready;
}
