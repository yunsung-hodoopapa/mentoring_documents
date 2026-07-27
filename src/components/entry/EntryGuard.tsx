import { EntryShell } from './EntryShell';
import { resolveShellMode } from './entryShellPolicy';
import { useMountCounter } from './lib/mountLog';
import { useEntryStatus } from './useEntryStatus';

/**
 * 라이더 앱의 진입 가드.
 *
 * 진입 상태를 보고 스플래시를 보여줄지 홈을 보여줄지 정합니다.
 */
export function EntryGuard() {
  useMountCounter('EntryGuard');

  const status = useEntryStatus();
  const mode = resolveShellMode(status);

  return <EntryShell mode={mode} />;
}
