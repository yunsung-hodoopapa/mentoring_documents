import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';
import { checkAndRequestCameraPermission, takeProofPhoto } from '../lib/fakeCamera';
import type { CapturedProofPhoto } from '../lib/fakeCamera';
import { uploadProofPhoto } from '../lib/deliveryApi';
import type { ModalRef } from '../types';

type PhotoProofSheetBaseProps = {
  onSubmit: (uploadedPath: string) => Promise<void>;
  onClose: () => void;
};

type PhotoProofSheetProps = PhotoProofSheetBaseProps &
  ({ flow: 'pickup' } | { flow: 'complete'; onAlreadyDelivered: () => void });

type PendingAction = 'submitted' | 'alreadyDelivered' | null;

export const PhotoProofSheet = forwardRef(function PhotoProofSheet(
  props: PhotoProofSheetProps,
  ref: ForwardedRef<ModalRef>,
) {
  const { onSubmit, onClose, flow } = props;

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const pendingActionRef = useRef<PendingAction>(null);
  const isCameraOpeningRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const sheetGenerationRef = useRef(0);
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedProofPhoto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSheet = () => {
    sheetGenerationRef.current += 1;
    pendingActionRef.current = null;
    isCameraOpeningRef.current = false;
    isSubmittingRef.current = false;
    setCapturedPhoto(null);
    setIsSubmitting(false);
    bottomSheetRef.current?.show();
  };
  const closeSheet = () => {
    bottomSheetRef.current?.hide();
  };

  const handleTakePhotoPress = async () => {
    if (isCameraOpeningRef.current || isSubmittingRef.current) {
      return;
    }

    isCameraOpeningRef.current = true;
    const sheetGeneration = sheetGenerationRef.current;
    try {
      const hasPermission = await checkAndRequestCameraPermission();
      if (!hasPermission || sheetGenerationRef.current !== sheetGeneration) {
        return;
      }

      const result = await takeProofPhoto();
      if (sheetGenerationRef.current !== sheetGeneration) {
        return;
      }

      if (result.status === 'captured') {
        setCapturedPhoto(result.photo);
        return;
      }

      window.alert('카메라를 열지 못했습니다. 다시 시도해주세요.');
    } finally {
      if (sheetGenerationRef.current === sheetGeneration) {
        isCameraOpeningRef.current = false;
      }
    }
  };

  const handleSubmitPress = async () => {
    if (!capturedPhoto || isSubmittingRef.current || pendingActionRef.current === 'submitted') {
      return;
    }

    isSubmittingRef.current = true;
    const sheetGeneration = sheetGenerationRef.current;
    setIsSubmitting(true);
    try {
      const { path } = await uploadProofPhoto(capturedPhoto.dataUrl);
      if (sheetGenerationRef.current !== sheetGeneration) {
        return;
      }

      pendingActionRef.current = 'submitted';
      bottomSheetRef.current?.hide();
      await onSubmit(path);
    } catch {
      if (sheetGenerationRef.current !== sheetGeneration) {
        return;
      }

      window.alert('사진 업로드에 실패했어요. 다시 제출해주세요.');
    } finally {
      if (sheetGenerationRef.current === sheetGeneration) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const handleAlreadyDeliveredPress = () => {
    pendingActionRef.current = 'alreadyDelivered';
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;

    if (pendingAction === 'submitted') {
      return;
    }

    sheetGenerationRef.current += 1;

    if (pendingAction === 'alreadyDelivered' && props.flow === 'complete') {
      props.onAlreadyDelivered();
      return;
    }

    onClose();
  };

  useImperativeHandle(ref, () => ({
    open: openSheet,
    close: closeSheet,
  }));

  useEffect(
    () => () => {
      sheetGenerationRef.current += 1;
    },
    [],
  );

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
          onClick={closeSheet}
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
                촬영하기
              </button>
              <button
                type="button"
                className="delivery-button-secondary"
                onClick={flow === 'complete' ? handleAlreadyDeliveredPress : closeSheet}
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
