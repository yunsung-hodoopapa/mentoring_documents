/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 */

export function track(event: string, properties?: Record<string, unknown>): void {
  console.info(`[analytics] ${event}`, properties ?? {});
}
