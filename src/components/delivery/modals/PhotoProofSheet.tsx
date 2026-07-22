import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';
import { checkAndRequestCameraPermission, takeProofPhoto } from '../lib/fakeCamera';
import type { CapturedProofPhoto } from '../lib/fakeCamera';
import { uploadProofPhoto } from '../lib/deliveryApi';

export type PhotoProofFlow = 'pickup' | 'complete';

export type PhotoProofOutcome =
  | { type: 'submitted'; uploadedPath: string }
  | { type: 'alreadyDelivered' }
  | { type: 'dismissed' };

export type PhotoProofSheetRef = {
  open: (flow: PhotoProofFlow) => Promise<PhotoProofOutcome>;
};

export const PhotoProofSheet = forwardRef(function PhotoProofSheet(
  _props: object,
  ref: ForwardedRef<PhotoProofSheetRef>,
) {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const resolveOutcomeRef = useRef<((outcome: PhotoProofOutcome) => void) | null>(null);
  const pendingOutcomeRef = useRef<PhotoProofOutcome | null>(null);

  const [flow, setFlow] = useState<PhotoProofFlow>('pickup');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedProofPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (nextFlow) =>
      new Promise<PhotoProofOutcome>((resolve) => {
        resolveOutcomeRef.current = resolve;
        pendingOutcomeRef.current = null;
        setFlow(nextFlow);
        setCapturedPhoto(null);
        setIsCapturing(false);
        setIsSubmitting(false);
        bottomSheetRef.current?.show();
      }),
  }));

  const handleTakePhotoPress = async () => {
    if (isCapturing || isSubmitting) {
      return;
    }

    setIsCapturing(true);
    try {
      const hasPermission = await checkAndRequestCameraPermission();
      if (!hasPermission) {
        return;
      }

      const result = await takeProofPhoto();
      if (result.status === 'captured') {
        setCapturedPhoto(result.photo);
        return;
      }

      window.alert('카메라를 열지 못했습니다. 다시 시도해주세요.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmitPress = async () => {
    if (!capturedPhoto || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { path } = await uploadProofPhoto(capturedPhoto.dataUrl);
      pendingOutcomeRef.current = { type: 'submitted', uploadedPath: path };
      bottomSheetRef.current?.hide();
    } catch {
      window.alert('사진 업로드에 실패했어요. 다시 제출해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlreadyDeliveredPress = () => {
    pendingOutcomeRef.current = { type: 'alreadyDelivered' };
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    const outcome = pendingOutcomeRef.current ?? { type: 'dismissed' as const };
    pendingOutcomeRef.current = null;
    resolveOutcomeRef.current?.(outcome);
    resolveOutcomeRef.current = null;
  };

  const title =
    flow === 'pickup'
      ? '픽업 지점과 다른 위치로 확인돼요'
      : '배달 주소와 다른 위치로 확인돼요';

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title={title}
      closable={!isSubmitting}
      onHide={handleHide}
    >
      <div className="delivery-sheet-body">
        <button
          type="button"
          className="delivery-sheet-close"
          aria-label="안내 닫기"
          disabled={isSubmitting}
          onClick={() => bottomSheetRef.current?.hide()}
        >
          ×
        </button>
        <p className="delivery-sheet-subtitle">
          {flow === 'pickup'
            ? '가게 앞에서 촬영해 인증해주세요'
            : '고객 문 앞에서 촬영해 인증해주세요'}
        </p>
        <div className="delivery-photo-frame">
          {capturedPhoto ? (
            <img
              src={capturedPhoto.dataUrl}
              alt="촬영한 인증 사진"
              width={capturedPhoto.width}
              height={capturedPhoto.height}
            />
          ) : (
            <div className="delivery-photo-placeholder">촬영한 사진이 여기에 표시됩니다</div>
          )}
        </div>
        <div className="delivery-sheet-buttons">
          {capturedPhoto ? (
            <>
              <button type="button" className="delivery-button-primary" onClick={handleSubmitPress}>
                {isSubmitting ? '제출 중...' : '제출하기'}
              </button>
              <button
                type="button"
                className="delivery-button-secondary"
                disabled={isSubmitting}
                onClick={handleTakePhotoPress}
              >
                다시찍기
              </button>
            </>
          ) : (
            <>
              <button type="button" className="delivery-button-primary" onClick={handleTakePhotoPress}>
                {isCapturing ? '촬영 중...' : '촬영하기'}
              </button>
              <button
                type="button"
                className="delivery-button-secondary"
                onClick={
                  flow === 'complete'
                    ? handleAlreadyDeliveredPress
                    : () => bottomSheetRef.current?.hide()
                }
              >
                {flow === 'complete' ? '이미 전달해서 촬영할 수 없어요' : '닫기'}
              </button>
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  );
});
