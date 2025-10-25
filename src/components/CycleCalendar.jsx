/**
 * Simple calendar/list view for cycle sessions.
 * Expects sessions to be an array of objects with at least:
 *  - id
 *  - scheduled_date (ISO date string)
 *  - name or title
 */
import React from 'react';

function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

export default function CycleCalendar({ sessions = [] }) {
  if (!sessions.length) return <p>No scheduled sessions yet.</p>;

  // Group by date (YYYY-MM-DD)
  const grouped = sessions.reduce((acc, s) => {
    const key = (s.scheduled_date || '').slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  return (
    <div className="cycle-calendar">
      {dates.map((d) => (
        <div key={d} className="cycle-calendar-day">
          <h5>{formatDate(d)}</h5>
          <ul>
            {grouped[d].map((s) => (
              <li key={s.id}>{s.title || s.name || s.exercise || 'Session'}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
