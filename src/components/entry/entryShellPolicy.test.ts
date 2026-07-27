import { describe, expect, it } from 'vitest';

import { EntryStatus, resolveShellMode, ShellMode } from './entryShellPolicy';

describe('resolveShellMode', () => {
  it('홈을 그리기 전 로딩 중에는 스플래시를 보여준다', () => {
    expect(resolveShellMode(EntryStatus.Loading, false)).toBe(ShellMode.Splash);
  });

  it('진입 준비가 끝나면 홈을 보여준다', () => {
    expect(resolveShellMode(EntryStatus.Ready, false)).toBe(ShellMode.Home);
  });

  // 홈을 그린 뒤 스플래시로 되돌아가면 홈이 언마운트되고,
  // 재마운트가 화면 쿼리를 전부 재발화시켜 루프가 됩니다.
  it('홈을 그린 뒤에는 로딩이 다시 와도 스플래시로 내려가지 않는다', () => {
    expect(resolveShellMode(EntryStatus.Loading, true)).toBe(ShellMode.Home);
  });

  it('구역을 못 받았으면 홈을 그린 뒤라도 실패 화면을 보여준다', () => {
    expect(resolveShellMode(EntryStatus.ZonesUnavailable, true)).toBe(ShellMode.ZonesError);
  });

  it('구역이 정말 없는 것은 실패가 아니라 홈으로 보낸다', () => {
    expect(resolveShellMode(EntryStatus.NoZones, false)).toBe(ShellMode.Home);
  });
});
