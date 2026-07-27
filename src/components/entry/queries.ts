import { useQuery } from '@tanstack/react-query';

import { riderApi } from './lib/riderApi';

export function useRiderProfile() {
  return useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: riderApi.fetchProfile,
  });
}

export function useDeliveryZones() {
  return useQuery({
    queryKey: ['rider', 'zones'],
    queryFn: riderApi.fetchZones,
  });
}

export function useRiderSettings() {
  return useQuery({
    queryKey: ['rider', 'settings'],
    queryFn: riderApi.fetchSettings,
    staleTime: 60_000,
  });
}

export function useScheduleChanges() {
  return useQuery({
    queryKey: ['rider', 'scheduleChanges'],
    queryFn: riderApi.fetchScheduleChanges,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['rider', 'notifications'],
    queryFn: riderApi.fetchNotifications,
  });
}

export function useScheduleEvents() {
  return useQuery({
    queryKey: ['rider', 'scheduleEvents'],
    queryFn: riderApi.fetchScheduleEvents,
  });
}
