/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 라이더 앱 API 호출부. 모든 응답을 requestLog에 기록합니다.
 */

import { recordRequest } from './requestLog';

export type RiderProfile = {
  id: number;
  name: string;
  vehicle: string;
};

export type DeliveryZone = {
  code: string;
  name: string;
};

export type ScheduleChange = {
  id: number;
  summary: string;
};

export type RiderNotification = {
  id: number;
  message: string;
};

export type ScheduleEvent = {
  id: number;
  startsAt: string;
  label: string;
};

export type RiderSettings = {
  pushEnabled: boolean;
  autoAccept: boolean;
};

class RiderApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'RiderApiError';
    this.status = status;
  }
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(path);
  recordRequest(path, response.status);

  if (!response.ok) {
    throw new RiderApiError(response.status, `${path} 요청이 실패했어요 (${response.status})`);
  }

  return (await response.json()) as T;
}

export const riderApi = {
  fetchProfile: () => get<RiderProfile>('/api/rider/me'),
  fetchZones: () => get<DeliveryZone[]>('/api/rider/me/delivery-zones'),
  fetchSettings: () => get<RiderSettings>('/api/rider/me/settings'),
  fetchScheduleChanges: () => get<ScheduleChange[]>('/api/rider/schedule-changes'),
  fetchNotifications: () => get<RiderNotification[]>('/api/rider/notifications'),
  fetchScheduleEvents: () => get<ScheduleEvent[]>('/api/rider/schedule-events'),
};
