import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';

export type LateReasonOutcome =
  | { type: 'selected'; isLateNegotiated: boolean }
  | { type: 'dismissed' };

export type LateReasonSheetRef = {
  open: () => Promise<LateReasonOutcome>;
};

export const LateReasonSheet = forwardRef(function LateReasonSheet(
  _props: object,
  ref: ForwardedRef<LateReasonSheetRef>,
) {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const resolveOutcomeRef = useRef<((outcome: LateReasonOutcome) => void) | null>(null);
  const pendingOutcomeRef = useRef<LateReasonOutcome | null>(null);

  useImperativeHandle(ref, () => ({
    open: () =>
      new Promise<LateReasonOutcome>((resolve) => {
        resolveOutcomeRef.current = resolve;
        pendingOutcomeRef.current = null;
        bottomSheetRef.current?.show();
      }),
  }));

  const handleSelect = (isLateNegotiated: boolean) => {
    pendingOutcomeRef.current = { type: 'selected', isLateNegotiated };
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    const outcome = pendingOutcomeRef.current ?? { type: 'dismissed' as const };
    pendingOutcomeRef.current = null;
    resolveOutcomeRef.current?.(outcome);
    resolveOutcomeRef.current = null;
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
