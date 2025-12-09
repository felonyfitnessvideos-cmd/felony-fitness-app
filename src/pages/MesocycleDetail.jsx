/**
 * @file MesocycleDetail.jsx
 * @description
 * Detail view for a single mesocycle. This page renders a horizontal date
 * scroller for the currently active week and the per-day routine assignments
 * for that week. It also shows completion state for each scheduled day by
 * consulting `cycle_sessions` and `workout_logs`.
 *
 * Responsibilities
 * - Load mesocycle metadata from `mesocycles` and its template rows from
 *   `mesocycle_weeks` so the UI can render week/day assignments even when no
 *   sessions exist yet.
 * - Optionally load `cycle_sessions` (instances) if the migration exists and
 *   use `is_complete` to determine completion state. Falls back to `workout_logs`
 *   if the sessions table or columns are not available.
 * - Allow the user to navigate into the workout logger for a given routine
 *   and to rearrange assignments within a week (client-optimistic swap with
 *   DB persistence).
 *
 * Data shapes
 * - mesocycle: { id, name, focus, weeks, start_date, user_id }
 * - mesocycle_weeks row: { id, mesocycle_id, week_index, day_index, routine_id?, notes?, day_type? }
 * - cycle_session row (optional): { id, mesocycle_id, scheduled_date, routine_id, is_deload?, planned_volume_multiplier?, is_complete? }
 *
 * Side effects & error modes
 * - Uses `supabase` to fetch and update the `mesocycle_weeks` rows; updates are
 *   attempted optimistically and reverted on failure. If the DB is missing
 *   expected columns (common during staged deploys), the client handles the
 *   error gracefully and continues to render available data.
 * - Swapping days issues two updates to `mesocycle_weeks`; a transactional
 *   server-side RPC is recommended for atomicity (not implemented here).
 *
 * Accessibility & UX
 * - Each routine card is clickable to open the workout logger if a routine is
 *   assigned. Move buttons are keyboard-focusable and have accessible titles.
 *
 * Export
 * - Default React component: `MesocycleDetail()`
 */

/** Audited: 2025-10-25 — JSDoc batch 9 */

/**
 * MesocycleDetail.jsx
 *
 * Detail view for a single mesocycle. Shows weeks, allows swapping weeks
 * and persisting the order. Ownership checks are performed before any
 * destructive operations.
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import './MesocycleDetail.css';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

function MesocycleDetail() {
  const { mesocycleId } = useParams();
  const [mesocycle, setMesocycle] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [weeksData, setWeeksData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Move a day assignment up or down within the current week
  const handleMoveDay = async (dayIndex, direction) => {
    // direction: -1 = up, +1 = down
    const from = (weeksData || []).find(w => w.week_index === currentWeekIndex && w.day_index === dayIndex);
    const to = (weeksData || []).find(w => w.week_index === currentWeekIndex && w.day_index === dayIndex + direction);
    if (!from || !to) return; // nothing to swap

    // Optimistic UI update: swap routine_id, notes, day_type between from and to
    const newWeeks = (weeksData || []).map(w => {
      if (w.id === from.id) return { ...w, routine_id: to.routine_id, notes: to.notes, day_type: to.day_type };
      if (w.id === to.id) return { ...w, routine_id: from.routine_id, notes: from.notes, day_type: from.day_type };
      return w;
    });
    setWeeksData(newWeeks);

    try {
      // Ensure current user owns this mesocycle before persisting changes
      if (!user || (mesocycle && mesocycle.user_id && mesocycle.user_id !== user.id)) {
        // revert optimistic update and abort
        setWeeksData(weeksData);
        return;
      }
      // persist swap to DB
      // update 'from' row to take 'to' values
      const { error: e1 } = await supabase.from('mesocycle_weeks').update({ routine_id: to.routine_id, notes: to.notes, day_type: to.day_type }).eq('id', from.id).eq('user_id', user.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('mesocycle_weeks').update({ routine_id: from.routine_id, notes: from.notes, day_type: from.day_type }).eq('id', to.id).eq('user_id', user.id);
      if (e2) throw e2;
    } catch (err) {
      console.error('Failed to swap days', err);
      // revert optimistic UI on failure
      setWeeksData(weeksData);
    }
  };

  useEffect(() => {
  if (!mesocycleId) return;
    (async () => {
      try {
        // wait for auth state
        if (loading) return;
        if (!user) {
          setMesocycle(null);
          // no sessions state here — detail shows weeks data
          return;
        }

        const { data: m } = await supabase
          .from('mesocycles')
          .select('*')
          .eq('id', mesocycleId)
          .eq('user_id', user.id)
          .maybeSingle();

        setMesocycle(m || null);

  // load mesocycle_week assignments so we can render week layouts even when no sessions exist
  const { data: weeksRows } = await supabase.from('mesocycle_weeks').select('*').eq('mesocycle_id', mesocycleId).order('week_index', { ascending: true }).order('day_index', { ascending: true });
  setWeeksData(weeksRows || []);
        // also load routine names referenced by this mesocycle via mesocycle_weeks
        const routineIds = Array.from(new Set((weeksRows || []).map(w => w.routine_id).filter(Boolean)));
        if (routineIds.length > 0) {
          const { data: rdata } = await supabase.from('workout_routines').select('id,routine_name').in('id', routineIds);
          setRoutines(rdata || []);
        } else {
          setRoutines([]);
        }

  // load cycle_sessions for mesocycle (if any) to help map scheduled dates and completion
  try {
    const { data: cs } = await supabase.from('cycle_sessions').select('id,scheduled_date,is_deload,is_complete,planned_volume_multiplier').eq('mesocycle_id', mesocycleId).order('scheduled_date', { ascending: true });
    setSessions(cs || []);
  } catch (err) {
    // If the migration hasn't been applied yet (or column selection fails), fall back to using workout_logs only.
    console.warn('Could not load cycle_sessions (possibly missing DB migration):', err?.message ?? err);
    setSessions([]);
  }

        // Fetch ALL workout logs for the routines in this mesocycle (regardless of date)
        // This allows users to complete workouts early or make up missed sessions
        if (routineIds.length > 0) {
          const { data: logs } = await supabase
            .from('workout_logs')
            .select('id,routine_id,created_at,is_complete')
            .eq('user_id', user.id)
            .in('routine_id', routineIds)
            .eq('is_complete', true)
            .order('created_at', { ascending: false });
          
          // Map logs by routine_id and date for lookup
          const map = {};
          (logs || []).forEach(l => {
            const dateKey = (new Date(l.created_at)).toISOString().slice(0,10);
            const key = `${l.routine_id}::${dateKey}`;
            // Keep most recent log for each routine+date combo
            if (!map[key]) {
              map[key] = l;
            }
          });
          setLogsMap(map);
        } else {
          setLogsMap({});
        }
      } catch (err) {
        console.error('Failed to load mesocycle detail', err.message ?? err);
      }
    })();
  }, [mesocycleId, loading, user]);

  // compute current week index based on mesocycle.start_date
  useEffect(() => {
    if (!mesocycle || !mesocycle.start_date) {
      setCurrentWeekIndex(1);
      return;
    }
    try {
      const start = new Date(mesocycle.start_date);
      const today = new Date();
      // normalize times
      start.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
      const week = Math.floor(diff / 7) + 1;
      const clamp = Math.max(1, Math.min(week, mesocycle.weeks || 1));
      setCurrentWeekIndex(clamp);
    } catch {
      setCurrentWeekIndex(1);
    }
  }, [mesocycle]);

  // No generate function here — mesocycle renders week assignments directly

  return (
    <div className="mesocycle-detail">
      <SubPageHeader title={mesocycle?.name ?? 'Mesocycle'} backTo="/mesocycles" />

      {/* Date scroller for the current week */}
      <div className="date-scroller">
        {(() => {
          // build week dates based on mesocycle.start_date and currentWeekIndex
          const items = [];
          try {
            if (mesocycle && mesocycle.start_date) {
              const start = new Date(mesocycle.start_date);
              const weekStart = new Date(start);
              weekStart.setDate(weekStart.getDate() + (currentWeekIndex - 1) * 7);
              for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
                const daynum = d.getDate();
                const iso = d.toISOString().slice(0,10);
                items.push({ weekday, daynum, iso });
              }
            } else {
              // fallback to Mon-Sun labels
              const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              for (let i = 0; i < 7; i++) items.push({ weekday: names[i], daynum: '', iso: null });
            }
          } catch {
            // noop
          }
          const todayIso = new Date().toISOString().slice(0,10);
          return items.map(it => (
            <div key={it.iso || it.weekday} className={`date-pill ${it.iso === todayIso ? 'today' : ''}`}>
              <div className="date-weekday">{it.weekday}</div>
              <div className="date-day">{it.daynum}</div>
            </div>
          ));
        })()}
      </div>

      

      {weeksData && weeksData.length > 0 && (
        <div className="mesocycle-routines">
          <h4>Week {currentWeekIndex}{mesocycle?.start_date ? ' (current)' : ''}</h4>
          <div className="routine-list">
            {Array.from({ length: 7 }).map((_, idx) => {
              const dayIndex = idx + 1;
              const entry = (weeksData || []).find(w => w.week_index === currentWeekIndex && w.day_index === dayIndex) || {};
              const routineId = entry.routine_id;
              const isDeload = entry.notes === 'deload' || entry.day_type === 'deload';
              // Determine display label: prefer routine name, then explicit notes (rest/deload), otherwise 'Unassigned'
              let label = 'Unassigned';
              if (routineId) label = routines.find(r => r.id === routineId)?.routine_name || 'Routine';
              else if (entry.notes) label = entry.notes;

              // compute scheduled date for this week/day if we have a start date
              let scheduledDateStr = null;
              if (mesocycle && mesocycle.start_date) {
                try {
                  const start = new Date(mesocycle.start_date);
                  const daysToAdd = (currentWeekIndex - 1) * 7 + (dayIndex - 1);
                  const d = new Date(start);
                  d.setDate(d.getDate() + daysToAdd);
                  scheduledDateStr = d.toISOString().slice(0,10);
                } catch {
                  scheduledDateStr = null;
                }
              }

              const logKey = routineId && scheduledDateStr ? `${routineId}::${scheduledDateStr}` : null;
              const log = logKey ? logsMap[logKey] : null;
              
              // Check if this routine has ANY completed log (regardless of date)
              // This allows users to complete workouts early or on different days
              const hasAnyCompletedLog = routineId ? 
                Object.keys(logsMap).some(key => key.startsWith(`${routineId}::`)) : 
                false;

              // prefer explicit cycle_session.is_complete if present
              let completed = false;
              if (scheduledDateStr) {
                const session = (sessions || []).find(s => {
                  if (!s || !s.scheduled_date) return false;
                  // compare YYYY-MM-DD
                  return s.scheduled_date.slice(0,10) === scheduledDateStr;
                });
                if (session && typeof session.is_complete !== 'undefined') {
                  completed = Boolean(session.is_complete);
                } else {
                  // Check exact date match first, then fallback to any completion
                  completed = Boolean(log && log.is_complete) || hasAnyCompletedLog;
                }
              } else {
                completed = Boolean(log && log.is_complete) || hasAnyCompletedLog;
              }

              return (
                <div key={dayIndex} className={`routine-card mesocycle-routine-card ${completed ? 'completed' : ''}`} onClick={() => routineId && navigate(`/log-workout/${routineId}?returnTo=/mesocycles/${mesocycleId}&date=${scheduledDateStr}`)}>
                  <div className="routine-info">
                    <div className="day-badge">
                      <div className="move-controls">
                        <button className="move-btn" title="Move up" onClick={(ev) => { ev.stopPropagation(); handleMoveDay(dayIndex, -1); }}><ArrowUp size={14} /></button>
                        <button className="move-btn" title="Move down" onClick={(ev) => { ev.stopPropagation(); handleMoveDay(dayIndex, 1); }}><ArrowDown size={14} /></button>
                      </div>
                      <div style={{ display: 'inline-block', marginLeft: '8px' }}>Day {dayIndex}</div>
                      {completed && <span className="check-icon"><Check size={14} /></span>}
                    </div>
                    <div>
                      <h4>{label}</h4>
                      <span className={`status-badge ${isDeload ? 'deload' : (routineId ? 'active' : 'inactive')}`}>{isDeload ? 'Deload' : (routineId ? 'Routine' : 'Rest')}</span>
                    </div>
                  </div>
                  <div className="routine-actions">
                    {routineId ? (
                      <>
                        <button className="action-button" onClick={(ev) => { ev.stopPropagation(); navigate(`/workouts/${routineId}/edit`); }} title="Edit">Edit</button>
                      </>
                    ) : (
                      entry.notes === 'rest' ? (
                        <div style={{ color: 'var(--text-secondary)' }}>Rest</div>
                      ) : entry.notes === 'deload' ? (
                        <div style={{ color: '#92400e' }}>Deload</div>
                      ) : (
                        <button className="action-button" onClick={() => navigate(`/mesocycles/new?mesocycleId=${mesocycleId}`)}>Assign</button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* bottom meta/actions moved here per UI request */}
      <div className="mesocycle-footer">
        {mesocycle && (
          <div className="mesocycle-meta">
            <p>Focus: {mesocycle.focus}</p>
            <p>Weeks: {mesocycle.weeks}</p>
            <p>Start: {mesocycle.start_date || 'TBD'}</p>
          </div>
        )}
        <div className="mesocycle-actions">
          <button className="btn" onClick={() => navigate(`/mesocycles/new?mesocycleId=${mesocycleId}`)}>Edit Mesocycle</button>
        </div>
      </div>
    </div>
  );
}

export default MesocycleDetail;
