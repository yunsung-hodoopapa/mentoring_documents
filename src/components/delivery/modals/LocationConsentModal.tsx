import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';

export type LocationConsentOutcome = 'agreed' | 'dismissed';

export type LocationConsentModalRef = {
  open: () => Promise<LocationConsentOutcome>;
};

export const LocationConsentModal = forwardRef(function LocationConsentModal(
  _props: object,
  ref: ForwardedRef<LocationConsentModalRef>,
) {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const resolveOutcomeRef = useRef<((outcome: LocationConsentOutcome) => void) | null>(null);
  const pendingOutcomeRef = useRef<LocationConsentOutcome | null>(null);

  useImperativeHandle(ref, () => ({
    open: () =>
      new Promise<LocationConsentOutcome>((resolve) => {
        resolveOutcomeRef.current = resolve;
        pendingOutcomeRef.current = null;
        bottomSheetRef.current?.show();
      }),
  }));

  const handleAgreePress = () => {
    pendingOutcomeRef.current = 'agreed';
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    const outcome = pendingOutcomeRef.current ?? 'dismissed';
    pendingOutcomeRef.current = null;
    resolveOutcomeRef.current?.(outcome);
    resolveOutcomeRef.current = null;
  };

  return (
    <BottomSheet ref={bottomSheetRef} title="위치정보 이용 동의" onHide={handleHide}>
      <div className="delivery-sheet-body">
        <p className="delivery-sheet-subtitle">
          픽업·배달 인증을 위해 현재 위치를 사용해요. 위치정보는 인증 목적에만 쓰여요.
        </p>
        <div className="delivery-sheet-buttons">
          <button type="button" className="delivery-button-primary" onClick={handleAgreePress}>
            동의하고 계속하기
          </button>
          <button
            type="button"
            className="delivery-button-secondary"
            onClick={() => bottomSheetRef.current?.hide()}
          >
            닫기
          </button>
        </div>
      </div>
    </BottomSheet>
  );
});
