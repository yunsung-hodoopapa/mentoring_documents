import { useMountCounter } from './lib/mountLog';
import {
  useDeliveryZones,
  useNotifications,
  useRiderSettings,
  useScheduleChanges,
  useScheduleEvents,
} from './queries';

export function RiderHomeScreen() {
  useMountCounter('RiderHomeScreen');

  const { data: zones } = useDeliveryZones();
  const { data: settings } = useRiderSettings();
  const { data: scheduleChanges } = useScheduleChanges();
  const { data: notifications } = useNotifications();
  const { data: scheduleEvents } = useScheduleEvents();

  return (
    <div className="entry-home">
      <header className="entry-home-header">
        <h2>오늘의 배차</h2>
        <div className="entry-zone-chips">
          {(zones ?? []).map((zone) => (
            <span key={zone.code} className="entry-zone-chip">
              {zone.name}
            </span>
          ))}
          {zones === undefined ? <span className="entry-zone-chip-empty">구역 없음</span> : null}
        </div>
      </header>

      <section className="entry-home-section">
        <h3>일정 변경</h3>
        <ul>
          {(scheduleChanges ?? []).map((change) => (
            <li key={change.id}>{change.summary}</li>
          ))}
        </ul>
      </section>

      <section className="entry-home-section">
        <h3>알림</h3>
        <ul>
          {(notifications ?? []).map((notification) => (
            <li key={notification.id}>{notification.message}</li>
          ))}
        </ul>
      </section>

      <section className="entry-home-section">
        <h3>피크 시간</h3>
        <ul>
          {(scheduleEvents ?? []).map((event) => (
            <li key={event.id}>
              {event.startsAt} · {event.label}
            </li>
          ))}
        </ul>
      </section>

      <p className="entry-home-settings">
        푸시 {settings?.pushEnabled ? '켜짐' : '꺼짐'} · 자동 수락{' '}
        {settings?.autoAccept ? '켜짐' : '꺼짐'}
      </p>
    </div>
  );
}
