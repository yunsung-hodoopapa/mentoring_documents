import { describe, expect, it } from 'vitest';

import { EntryStatus, resolveShellMode, ShellMode } from './entryShellPolicy';

/**
 * 테스트 작성 패턴 예시입니다. 미션 5에서 이 파일에 케이스를 추가하게 됩니다.
 */
describe('resolveShellMode', () => {
  it('로딩 중에는 스플래시를 보여준다', () => {
    expect(resolveShellMode(EntryStatus.Loading)).toBe(ShellMode.Splash);
  });

  it('진입 준비가 끝나면 홈을 보여준다', () => {
    expect(resolveShellMode(EntryStatus.Ready)).toBe(ShellMode.Home);
  });
});
