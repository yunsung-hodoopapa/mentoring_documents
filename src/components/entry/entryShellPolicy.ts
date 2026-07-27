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
 * 스플래시는 앱을 켜고 처음 한 번 보여주는 화면입니다. 홈을 이미 그린 뒤에는
 * 어떤 이유로 다시 로딩이 되더라도 스플래시로 되돌아가지 않습니다.
 * 되돌아가면 홈이 언마운트되고, 재마운트가 화면 쿼리를 전부 재발화시킵니다.
 */
export function resolveShellMode(status: EntryStatus, hasRenderedHome: boolean): ShellMode {
  if (status === EntryStatus.Loading && !hasRenderedHome) {
    return ShellMode.Splash;
  }

  return ShellMode.Home;
}
