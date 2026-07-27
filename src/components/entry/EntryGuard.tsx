import { useLayoutEffect, useState } from 'react';

import { EntryShell } from './EntryShell';
import { resolveShellMode, ShellMode } from './entryShellPolicy';
import { useMountCounter } from './lib/mountLog';
import { useEntryStatus } from './useEntryStatus';

/**
 * 라이더 앱의 진입 가드.
 *
 * 진입 상태를 보고 스플래시를 보여줄지 홈을 보여줄지 정합니다.
 */
export function EntryGuard() {
  useMountCounter('EntryGuard');

  // 렌더에 쓰이는 값이라 ref 가 아니라 state 입니다.
  // ref 에 렌더 도중 값을 넣으면 React 가 버린 렌더까지 기록될 수 있습니다.
  const [hasRenderedHome, setHasRenderedHome] = useState(false);

  const status = useEntryStatus();
  const mode = resolveShellMode(status, hasRenderedHome);

  // 커밋 직후 동기로 실행되므로, 실제로 화면에 올라간 렌더만 기록됩니다.
  useLayoutEffect(() => {
    if (mode === ShellMode.Home) {
      setHasRenderedHome(true);
    }
  }, [mode]);

  return <EntryShell mode={mode} />;
}
