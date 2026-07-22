import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ForwardedRef, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export type BottomSheetRef = {
  show: () => void;
  hide: () => void;
};

type BottomSheetProps = {
  title: string;
  closable?: boolean;
  onHide?: () => void;
  children: ReactNode;
};

/**
 * 실습 인프라 — 수정 대상이 아닙니다.
 *
 * 모바일 앱의 BottomSheet 컴포넌트를 웹으로 옮긴 셸입니다.
 * ref로 show()/hide()를 노출하고, 어떤 경로로든 닫히면(프로그램 호출,
 * 백드롭 클릭, ESC) onHide가 한 번 호출됩니다.
 */
export const BottomSheet = forwardRef(function BottomSheet(
  props: BottomSheetProps,
  ref: ForwardedRef<BottomSheetRef>,
) {
  const { title, closable = true, onHide, children } = props;
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
    onHide?.();
  };

  useImperativeHandle(ref, () => ({
    show: () => setIsOpen(true),
    hide: close,
  }));

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      return;
    }
    if (!closable) {
      return;
    }
    close();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="delivery-sheet-overlay" />
        <DialogPrimitive.Content className="delivery-sheet-content" aria-describedby={undefined}>
          <DialogPrimitive.Title className="delivery-sheet-title">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
});
