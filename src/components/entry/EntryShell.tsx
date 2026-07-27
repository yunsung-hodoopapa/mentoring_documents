import { RiderHomeScreen } from './RiderHomeScreen';
import { ShellMode } from './entryShellPolicy';
import { SplashScreen } from './SplashScreen';
import { ZonesErrorScreen } from './ZonesErrorScreen';

type EntryShellProps = {
  mode: ShellMode;
};

export function EntryShell(props: EntryShellProps) {
  const { mode } = props;

  if (mode === ShellMode.Splash) {
    return <SplashScreen />;
  }

  if (mode === ShellMode.ZonesError) {
    return <ZonesErrorScreen />;
  }

  return <RiderHomeScreen />;
}
