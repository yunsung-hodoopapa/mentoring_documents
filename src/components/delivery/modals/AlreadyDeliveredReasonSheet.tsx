import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { ForwardedRef } from 'react';

import { BottomSheet } from '../lib/BottomSheet';
import type { BottomSheetRef } from '../lib/BottomSheet';

export type AlreadyDeliveredReasonOutcome =
  | { type: 'submitted'; reason: string }
  | { type: 'dismissed' };

export type AlreadyDeliveredReasonSheetRef = {
  open: () => Promise<AlreadyDeliveredReasonOutcome>;
};

export const AlreadyDeliveredReasonSheet = forwardRef(function AlreadyDeliveredReasonSheet(
  _props: object,
  ref: ForwardedRef<AlreadyDeliveredReasonSheetRef>,
) {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const resolveOutcomeRef = useRef<((outcome: AlreadyDeliveredReasonOutcome) => void) | null>(
    null,
  );
  const pendingOutcomeRef = useRef<AlreadyDeliveredReasonOutcome | null>(null);
  const [reason, setReason] = useState('');

  useImperativeHandle(ref, () => ({
    open: () =>
      new Promise<AlreadyDeliveredReasonOutcome>((resolve) => {
        resolveOutcomeRef.current = resolve;
        pendingOutcomeRef.current = null;
        setReason('');
        bottomSheetRef.current?.show();
      }),
  }));

  const handleSubmitPress = () => {
    if (!reason.trim()) {
      window.alert('전달 상황을 입력해주세요.');
      return;
    }

    pendingOutcomeRef.current = { type: 'submitted', reason: reason.trim() };
    bottomSheetRef.current?.hide();
  };

  const handleHide = () => {
    const outcome = pendingOutcomeRef.current ?? { type: 'dismissed' as const };
    pendingOutcomeRef.current = null;
    resolveOutcomeRef.current?.(outcome);
    resolveOutcomeRef.current = null;
  };

  return (
    <BottomSheet ref={bottomSheetRef} title="이미 전달하셨나요?" onHide={handleHide}>
      <div className="delivery-sheet-body">
        <p className="delivery-sheet-subtitle">
          어떻게 전달했는지 남겨주시면 확인 후 완료 처리할게요.
        </p>
        <textarea
          className="delivery-reason-input"
          placeholder="예: 문 앞에 두고 고객에게 전화로 안내했어요"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
        />
        <div className="delivery-sheet-buttons">
          <button type="button" className="delivery-button-primary" onClick={handleSubmitPress}>
            제출하기
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
