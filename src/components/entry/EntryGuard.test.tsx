import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EntryStatus, ShellMode } from './entryShellPolicy';

const mockUseEntryStatus = vi.fn();
const shellModes: ShellMode[] = [];

vi.mock('./useEntryStatus', () => ({
  useEntryStatus: () => mockUseEntryStatus(),
}));

// 실제 화면까지 렌더하면 쿼리가 필요하므로, 셸에 넘어온 mode 만 기록합니다.
vi.mock('./EntryShell', () => ({
  EntryShell: ({ mode }: { mode: ShellMode }) => {
    shellModes.push(mode);
    return <div data-testid="shell">{mode}</div>;
  },
}));

const { EntryGuard } = await import('./EntryGuard');

describe('EntryGuard', () => {
  beforeEach(() => {
    shellModes.length = 0;
  });

  it('홈을 그리기 전 로딩은 스플래시로 보여준다', () => {
    mockUseEntryStatus.mockReturnValue(EntryStatus.Loading);

    render(<EntryGuard />);

    expect(screen.getByTestId('shell')).toHaveTextContent(ShellMode.Splash);
  });

  /**
   * 이 테스트가 미션 5의 핵심입니다.
   *
   * resolveShellMode 에 hasRenderedHome: true 를 직접 넣는 테스트는
   * EntryGuard 의 latch 를 전부 지워도 통과합니다. 그래서 여기서는
   * latch 가 그 값을 실제로 만들어주는지를 봅니다.
   */
  it('홈을 그린 뒤 로딩으로 되돌아가도 스플래시로 내려가지 않는다', () => {
    mockUseEntryStatus.mockReturnValue(EntryStatus.Ready);
    const { rerender } = render(<EntryGuard />);
    expect(shellModes.at(-1)).toBe(ShellMode.Home);

    mockUseEntryStatus.mockReturnValue(EntryStatus.Loading);
    rerender(<EntryGuard />);

    expect(shellModes.at(-1)).toBe(ShellMode.Home);
    expect(shellModes).not.toContain(ShellMode.Splash);
  });

  it('구역을 못 받으면 홈을 그린 뒤라도 실패 화면으로 간다', () => {
    mockUseEntryStatus.mockReturnValue(EntryStatus.Ready);
    const { rerender } = render(<EntryGuard />);

    mockUseEntryStatus.mockReturnValue(EntryStatus.ZonesUnavailable);
    rerender(<EntryGuard />);

    expect(shellModes.at(-1)).toBe(ShellMode.ZonesError);
  });
});
