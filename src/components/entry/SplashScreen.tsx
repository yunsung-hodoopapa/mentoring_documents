import { useMountCounter } from './lib/mountLog';

export function SplashScreen() {
  useMountCounter('SplashScreen');

  return (
    <div className="entry-splash">
      <div className="entry-splash-logo">배달모아</div>
      <p className="entry-splash-text">배달 구역을 불러오는 중이에요…</p>
    </div>
  );
}
