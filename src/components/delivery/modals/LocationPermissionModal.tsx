import { forwardRef, useRef, useImperativeHandle } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';

export const LocationPermissionModal = forwardRef(function LocationPermissionModal(
  _props: object,
  ref: ForwardedRef<BottomSheetRef>,
) {
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  useImperativeHandle(ref, () => ({
    show: () => bottomSheetRef.current?.show(),
    hide: () => bottomSheetRef.current?.hide(),
  }));

  return (
    <BottomSheet ref={bottomSheetRef} title="위치 권한이 꺼져 있어요">
      <div className="delivery-sheet-body">
        <p className="delivery-sheet-subtitle">
          픽업·배달 인증에는 위치 권한이 필요해요. 화면 상단 개발자 도구에서 위치 권한을
          허용으로 바꾼 뒤 다시 시도해주세요.
        </p>
        <div className="delivery-sheet-buttons">
          <button
            type="button"
            className="delivery-button-primary"
            onClick={() => bottomSheetRef.current?.hide()}
          >
            확인
          </button>
        </div>
      </div>
    </BottomSheet>
  );
});
