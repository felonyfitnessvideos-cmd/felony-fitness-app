/**
 * @file CycleCalendar.jsx
 * @description Simple calendar/list view for cycle sessions grouped by date
 * @project Felony Fitness
 * 
 * This component provides a visual calendar interface for displaying scheduled
 * workout sessions. It groups sessions by date and renders them in a clean
 * list format with proper date formatting and error handling.
 */
import React from 'react';

/**
 * Formats a date value for display in the calendar
 * @param {string|Date} d - The date to format (ISO string or Date object)
 * @returns {string} - Formatted date string or original value if formatting fails
 */
function formatDate(d) {
  try {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return String(d);
  }
}

/**
 * Calendar component that displays workout sessions grouped by date
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Array of session objects with id, scheduled_date, and name/title
 * @returns {JSX.Element} - Calendar view with sessions grouped by date
 */
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
