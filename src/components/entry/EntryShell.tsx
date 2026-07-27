import { RiderHomeScreen } from './RiderHomeScreen';
import { ShellMode } from './entryShellPolicy';
import { SplashScreen } from './SplashScreen';

type EntryShellProps = {
  mode: ShellMode;
};

export function EntryShell(props: EntryShellProps) {
  const { mode } = props;

  if (mode === ShellMode.Splash) {
    return <SplashScreen />;
  }

  return <RiderHomeScreen />;
}
