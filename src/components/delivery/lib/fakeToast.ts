/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 */

export function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'delivery-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}
