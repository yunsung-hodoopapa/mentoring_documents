import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';
import type { ModalRef } from '../types';

type LateReasonSheetProps = {
  onSelect: (isLateNegotiated: boolean) => Promise<void> | void;
  onClose: () => void;
};

export const LateReasonSheet = forwardRef(function LateReasonSheet(
  props: LateReasonSheetProps,
  ref: ForwardedRef<ModalRef>,
) {
  const { onSelect, onClose } = props;

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const pendingSelectionRef = useRef<boolean | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      pendingSelectionRef.current = null;
      bottomSheetRef.current?.show();
    },
    close: () => bottomSheetRef.current?.hide(),
  }));

  const handleSelect = (isLateNegotiated: boolean) => {
    pendingSelectionRef.current = isLateNegotiated;
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    const pendingSelection = pendingSelectionRef.current;
    pendingSelectionRef.current = null;

    if (pendingSelection === null) {
      onClose();
      return;
    }

    void onSelect(pendingSelection);
  };

  return (
    <BottomSheet ref={bottomSheetRef} title="예정보다 늦게 도착했어요" onHide={handleHide}>
      <div className="delivery-sheet-body">
        <p className="delivery-sheet-subtitle">고객과 지연 도착을 협의하셨나요?</p>
        <div className="delivery-sheet-buttons">
          <button
            type="button"
            className="delivery-button-primary"
            onClick={() => handleSelect(true)}
          >
            협의했어요
          </button>
          <button
            type="button"
            className="delivery-button-secondary"
            onClick={() => handleSelect(false)}
          >
            협의하지 못했어요
          </button>
        </div>
      </div>
    </BottomSheet>
  );
});
