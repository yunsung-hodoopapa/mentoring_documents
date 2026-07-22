/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 시스템 카메라 대신 캔버스로 사진을 생성하는 가짜 카메라입니다.
 */

export type CapturedProofPhoto = {
  dataUrl: string;
  width: number;
  height: number;
};

export type TakePhotoResult =
  | { status: 'captured'; photo: CapturedProofPhoto }
  | { status: 'error' };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkAndRequestCameraPermission(): Promise<boolean> {
  await delay(300);
  return true;
}

export async function takeProofPhoto(): Promise<TakePhotoResult> {
  await delay(800);

  const width = 400;
  const height = 300;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return { status: 'error' };
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#111827');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#ffffff';
  context.font = '20px sans-serif';
  context.fillText('인증 사진', 24, 48);
  context.font = '14px sans-serif';
  context.fillText(new Date().toLocaleTimeString(), 24, 76);

  return {
    status: 'captured',
    photo: { dataUrl: canvas.toDataURL('image/png'), width, height },
  };
}
