import type { CompleteDeliveryDto, Delivery, StartPickupDto } from '../types';

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 배달 API 클라이언트. MSW가 응답합니다 (src/mocks/handlers.ts).
 */

export class DeliveryApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'DeliveryApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new DeliveryApiError(
      response.status,
      body?.code ?? 'UNKNOWN',
      body?.message ?? '요청에 실패했습니다.',
    );
  }

  return body as T;
}

export function fetchDeliveries(): Promise<Delivery[]> {
  return request<Delivery[]>('/api/deliveries');
}

export function startPickup(deliveryId: number, dto: StartPickupDto): Promise<{ pickedUpAt: string }> {
  return request(`/api/deliveries/${deliveryId}/pickup`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function completeDelivery(
  deliveryId: number,
  dto: CompleteDeliveryDto,
): Promise<{ deliveredAt: string }> {
  return request(`/api/deliveries/${deliveryId}/complete`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function uploadProofPhoto(dataUrl: string): Promise<{ path: string }> {
  return request('/api/uploads/proof', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });
}

export function isLocationVerificationFailedError(error: unknown): boolean {
  return error instanceof DeliveryApiError && error.code === 'LOCATION_VERIFICATION_FAILED';
}

export function isLateNegotiationRequiredError(error: unknown): boolean {
  return error instanceof DeliveryApiError && error.code === 'LATE_NEGOTIATION_REQUIRED';
}
