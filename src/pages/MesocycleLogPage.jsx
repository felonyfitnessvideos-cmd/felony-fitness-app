/**
 * @file MesocycleLogPage.jsx
 * @description
 * A dedicated logging view that renders all generated `cycle_sessions` for a
 * mesocycle grouped by week and shows their completion state. From here users
 * can start a new workout log for a pending session or view/edit an existing
 * completed log.
 *
 * Responsibilities
 * - Fetch mesocycle metadata and its generated `cycle_sessions` for the
 *   provided `mesocycleId`.
 * - Fetch `workout_logs` in the session date range for the current user to
 *   determine which sessions are completed and which are pending.
 * - Provide a primary flow to navigate into the workout logger for a
 *   specific mesocycle session, attaching query params (`date`,
 *   `mesocycle_session_id`, `returnTo`) so the logger can link back.
 *
 * Data shapes
 * - cycle_session: { id, mesocycle_id, week_index, scheduled_date, routine_id, is_deload?, notes?, day_type? }
 * - workout_log: { id, routine_id, created_at, is_complete }
 *
 * Side effects & error modes
 * - If `cycle_sessions` or `workout_logs` cannot be fetched due to missing
 *   migrations or permissions, the page will log the error to console and
 *   attempt to render whatever data is available. Navigation still functions
 *   and will pass query params to the logger where applicable.
 *
 * Note
 * - Dates used to match `cycle_sessions` to `workout_logs` are normalized to
 *   an explicit YYYY-MM-DD string to avoid timezone / timestamp format
 *   mismatches between `scheduled_date` and `created_at` values. See the
 *   TODO below for a reminder when auditing date handling.
 *
 * TODO
 * - Ensure that server-side migrations use consistent date/timestamp types
 *   (prefer `date` for scheduled_date and `timestamp with time zone` for
 *   created_at) and confirm normalization assumptions here after migrating.
 *
 * Export
 * - Default React component: `MesocycleLogPage()`
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './MesocycleLogPage.css';

/**
 * Format a date-like input into a short weekday, abbreviated month, and day string.
 * @param {Date|string|number|null|undefined} d - A Date object, timestamp, or date string; may be null/undefined.
 * @returns {string} The formatted date like "Mon, Oct 21". If formatting fails or the input is invalid, returns the original input unchanged.
 */
function formatDateShort(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return d; }
}

// Normalize a date-like value to YYYY-MM-DD. Accepts Date, timestamp string,
/**
 * Normalize a date-like value to a YYYY-MM-DD string.
 * @param {Date|string|number|null|undefined} val - Date object, timestamp, or date string to normalize.
 * @returns {string} A `YYYY-MM-DD` formatted date, or an empty string if the input is null, undefined, or invalid.
 */
function toISODate(val) {
  if (val === null || val === undefined) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
}

/**
 * Render a mesocycle's scheduled sessions grouped by week and provide navigation to log or view workout logs.
 *
 * Fetches mesocycle metadata, its cycle sessions, associated routine names, and the current user's workout logs
 * within the sessions' date range to determine completion state. Displays sessions grouped by week, shows
 * completion and deload badges, and allows opening the workout logger/viewer for a session.
 *
 * @returns {JSX.Element} The React element for the mesocycle log page.
 */
function MesocycleLogPage() {
  const { mesocycleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mesocycle, setMesocycle] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [routinesMap, setRoutinesMap] = useState({});
  const [logsMap, setLogsMap] = useState({});
  const [loading, setLoading] = useState(true);

  /**
   * Notes
   * - Date matching between `cycle_sessions.scheduled_date` and
   *   `workout_logs.created_at` uses YYYY-MM-DD normalization (see `toISODate`)
   *   to avoid timezone mismatches. This is intentionally a client-side
   *   compatibility layer; prefer using `date` for scheduled_date server-side
   *   to avoid ambiguity.
   */

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mesocycleId || !user) return;
      setLoading(true);
      try {
        const { data: mdata, error: mErr } = await supabase.from('mesocycles').select('*').eq('id', mesocycleId).maybeSingle();
        if (mErr) throw mErr;
        if (!mounted) return;
        setMesocycle(mdata || null);

        // Load sessions for this mesocycle
        const { data: sdata, error: sErr } = await supabase.from('cycle_sessions').select('*').eq('mesocycle_id', mesocycleId).order('scheduled_date', { ascending: true });
        if (sErr) throw sErr;
        if (!mounted) return;
        setSessions(sdata || []);

        // Gather routine ids and fetch their names
        const routineIds = Array.from(new Set((sdata || []).map(s => s.routine_id).filter(Boolean)));
        if (routineIds.length > 0) {
          const { data: rdata } = await supabase.from('workout_routines').select('id,routine_name').in('id', routineIds);
          const map = {};
          (rdata || []).forEach(r => { map[r.id] = r.routine_name; });
          if (!mounted) return;
          setRoutinesMap(map);
        }

        // Load workout_logs in range of session dates for this user to determine completion
        if ((sdata || []).length > 0) {
          const dates = (sdata || []).map(s => s.scheduled_date).filter(Boolean).sort();
          const minDate = dates[0];
          const maxDate = dates[dates.length - 1];
          const { data: logs } = await supabase.from('workout_logs').select('id,routine_id,created_at,is_complete').eq('user_id', user.id).gte('created_at', minDate).lte('created_at', maxDate);
          const map = {};
          (logs || []).forEach(l => {
            const key = `${l.routine_id}::${toISODate(l.created_at)}`;
            map[key] = l;
          });
          if (!mounted) return;
          setLogsMap(map);
        }

      } catch (err) {
        console.error('Failed to load mesocycle log data', err?.message ?? err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mesocycleId, user]);

  const weeks = useMemo(() => {
    const grouped = {};
    sessions.forEach(s => {
      const wk = s.week_index || 1;
      grouped[wk] = grouped[wk] || [];
      grouped[wk].push(s);
    });
    return grouped;
  }, [sessions]);

  const todayISO = toISODate(new Date());

  const currentSession = useMemo(() => {
    // next scheduled session on or after today that doesn't have a completed log
    for (const s of sessions) {
      const schedISO = toISODate(s.scheduled_date);
      const key = `${s.routine_id}::${schedISO}`;
      const log = logsMap[key];
      if (!log || !log.is_complete) {
        // pick the first incomplete session whose scheduled_date >= today
        if (schedISO >= todayISO) return s;
      }
    }
    return null;
  }, [sessions, logsMap, todayISO]);

  const handleOpenLog = (session) => {
    if (!session) return;
    const routineId = session.routine_id;
    // Navigate to workout log for the routine. Append query params so WorkoutLogPage
    // can optionally use them (e.g., to prefill date or locate the mesocycle session).
    const params = new URLSearchParams();
    if (session.scheduled_date) params.set('date', session.scheduled_date);
    params.set('mesocycle_session_id', session.id);
    // Include a returnTo param so the workout logger can return to the mesocycle log
    params.set('returnTo', `/mesocycles/${mesocycleId}/log`);
    navigate(`/log-workout/${routineId}?${params.toString()}`);
  };

  if (loading) return <div className="loading-message">Loading mesocycle log...</div>;

  return (
    <div className="mesocycle-log-page">
      <SubPageHeader title={mesocycle?.name || 'Mesocycle Log'} backTo={`/mesocycles/${mesocycleId}`} />

      <div className="mesocycle-summary">
        <div><strong>Focus:</strong> {mesocycle?.focus || '—'}</div>
        <div><strong>Weeks:</strong> {mesocycle?.weeks || '—'}</div>
        <div><strong>Start:</strong> {mesocycle?.start_date || '—'}</div>
        <div><strong>Current:</strong> {currentSession ? formatDateShort(currentSession.scheduled_date) : 'All done'}</div>
      </div>

      <div className="weeks-container">
        {Object.keys(weeks).sort((a,b)=>a-b).map(wk => (
          <div className="week-block" key={wk}>
            <h4>Week {wk}</h4>
            <div className="days-grid">
              {weeks[wk].map((s) => {
                const label = routinesMap[s.routine_id] || (s.notes || s.status) || 'Rest';
                const key = `${s.routine_id}::${toISODate(s.scheduled_date)}`;
                const completed = !!(logsMap[key] && logsMap[key].is_complete);
                const isDeload = !!(s.is_deload) || s.status === 'deload' || s.notes === 'deload' || s.day_type === 'deload';
                return (
                  <div className={`day-card ${completed ? 'completed' : ''} ${isDeload ? 'deload' : ''}`} key={s.id}>
                    <div className="day-header">{formatDateShort(s.scheduled_date)}</div>
                    <div className="day-body">
                      <div className="routine-name">{label}</div>
                      <div className="status-row">
                        {completed ? <span className="badge done">Completed</span> : <span className="badge pending">Pending</span>}
                        {isDeload && <span className="badge deload">Deload</span>}
                      </div>
                    </div>
                    <div className="day-actions">
                      {!completed ? (
                        <button className="btn" onClick={() => handleOpenLog(s)}>Log</button>
                      ) : (
                        <button className="btn" onClick={() => handleOpenLog(s)}>View / Edit</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MesocycleLogPage;