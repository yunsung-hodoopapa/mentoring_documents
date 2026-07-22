import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';
import type { ModalRef } from '../types';

type LocationConsentModalProps = {
  onAgree: () => Promise<void> | void;
  onAgreeDismissed: () => void;
};

export const LocationConsentModal = forwardRef(function LocationConsentModal(
  props: LocationConsentModalProps,
  ref: ForwardedRef<ModalRef>,
) {
  const { onAgree, onAgreeDismissed } = props;

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const hasAgreedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      hasAgreedRef.current = false;
      bottomSheetRef.current?.show();
    },
    close: () => bottomSheetRef.current?.hide(),
  }));

  const handleAgreePress = async () => {
    await onAgree();
    hasAgreedRef.current = true;
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    if (hasAgreedRef.current) {
      hasAgreedRef.current = false;
      onAgreeDismissed();
    }
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
