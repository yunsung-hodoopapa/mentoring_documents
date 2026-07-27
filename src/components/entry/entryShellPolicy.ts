export const EntryStatus = {
  Loading: 'loading',
  NoZones: 'noZones',
  Ready: 'ready',
} as const;

export type EntryStatus = (typeof EntryStatus)[keyof typeof EntryStatus];

export const ShellMode = {
  Splash: 'splash',
  Home: 'home',
} as const;

export type ShellMode = (typeof ShellMode)[keyof typeof ShellMode];

/**
 * 진입 상태를 보고 어떤 화면을 그릴지 정합니다.
 *
 * 스플래시는 앱을 켜고 처음 한 번 보여주는 화면입니다.
 */
export function resolveShellMode(status: EntryStatus): ShellMode {
  if (status === EntryStatus.Loading) {
    return ShellMode.Splash;
  }

  return ShellMode.Home;
}
