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

/**
 * Convert a Date object to local YYYY-MM-DD string (not UTC)
 * This prevents timezone issues where dates show as "yesterday"
 */
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
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
  const [autoCalculatedWeek, setAutoCalculatedWeek] = useState(1);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Skip a routine (mark as complete without logging workout)
  const handleSkipRoutine = async (routineId, dayIndex) => {
    if (!user || !routineId) return;
    
    try {
      // Find the specific mesocycle_weeks entry for this week and day
      const entry = weeksData.find(w => 
        w.week_index === currentWeekIndex && 
        w.day_index === dayIndex &&
        w.routine_id === routineId
      );
      
      if (!entry) {
        console.error('Could not find mesocycle_weeks entry to skip');
        return;
      }
      
      // Update is_complete flag on this specific entry
      const { error } = await supabase
        .from('mesocycle_weeks')
        .update({ 
          is_complete: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', entry.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state to reflect the skip
      setWeeksData(prev => prev.map(w => 
        w.id === entry.id 
          ? { ...w, is_complete: true, completed_at: new Date().toISOString() }
          : w
      ));
    } catch (err) {
      console.error('Failed to skip routine:', err);
      alert('Failed to skip routine. Please try again.');
    }
  };

  // Move a day assignment up or down within the current week
  const handleMoveDay = async (dayIndex, direction) => {
    // direction: -1 = up, +1 = down
    const from = (weeksData || []).find(w => w.week_index === currentWeekIndex && w.day_index === dayIndex);
    const to = (weeksData || []).find(w => w.week_index === currentWeekIndex && w.day_index === dayIndex + direction);
    if (!from || !to) return; // nothing to swap

    // Optimistic UI update: swap routine_id, notes, day_type, is_complete, completed_at between from and to
    const newWeeks = (weeksData || []).map(w => {
      if (w.id === from.id) return { ...w, routine_id: to.routine_id, notes: to.notes, day_type: to.day_type, is_complete: to.is_complete, completed_at: to.completed_at };
      if (w.id === to.id) return { ...w, routine_id: from.routine_id, notes: from.notes, day_type: from.day_type, is_complete: from.is_complete, completed_at: from.completed_at };
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
      // persist swap to DB - include is_complete and completed_at to preserve completion status
      // update 'from' row to take 'to' values
      const { error: e1 } = await supabase.from('mesocycle_weeks').update({ 
        routine_id: to.routine_id, 
        notes: to.notes, 
        day_type: to.day_type,
        is_complete: to.is_complete || false,
        completed_at: to.completed_at || null
      }).eq('id', from.id).eq('user_id', user.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('mesocycle_weeks').update({ 
        routine_id: from.routine_id, 
        notes: from.notes, 
        day_type: from.day_type,
        is_complete: from.is_complete || false,
        completed_at: from.completed_at || null
      }).eq('id', to.id).eq('user_id', user.id);
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

        console.log('🔍 MESOCYCLE DATA LOADED:');
        console.log('Mesocycle:', JSON.stringify(m, null, 2));

  // load mesocycle_week assignments so we can render week layouts even when no sessions exist
  let weeksRows = [];
  try {
    // Try to select new columns (is_complete, completed_at, day_type) if migration has been run
    const { data, error } = await supabase.from('mesocycle_weeks').select('id,mesocycle_id,week_index,day_index,routine_id,notes,day_type,is_complete,completed_at').eq('mesocycle_id', mesocycleId).order('week_index', { ascending: true }).order('day_index', { ascending: true });
    if (error) throw error;
    weeksRows = data || [];
    console.log('🔍 WEEKS DATA LOADED:', weeksRows.length, 'rows');
    console.log('Current week index:', currentWeekIndex);
    console.log('Week 2 data:', weeksRows.filter(w => w.week_index === 2));
  } catch (err) {
    // If new columns don't exist yet, fall back to selecting only basic columns
    console.warn('Could not load new columns (migration not run yet), falling back:', err?.message ?? err);
    const { data } = await supabase.from('mesocycle_weeks').select('id,mesocycle_id,week_index,day_index,routine_id,notes').eq('mesocycle_id', mesocycleId).order('week_index', { ascending: true }).order('day_index', { ascending: true });
    weeksRows = data || [];
  }
  setWeeksData(weeksRows || []);
        // also load routine names referenced by this mesocycle via mesocycle_weeks
        const routineIds = Array.from(new Set((weeksRows || []).map(w => w.routine_id).filter(Boolean)));
        console.log('🔍 ROUTINE IDs found:', routineIds);
        if (routineIds.length > 0) {
          const { data: rdata } = await supabase.from('workout_routines').select('id,routine_name').in('id', routineIds);
          console.log('🔍 ROUTINES LOADED:', rdata);
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
            const dateKey = toLocalDateString(new Date(l.created_at));
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

  // Compute current week index based ONLY on completion status (no dates)
  // Show the first week that has any incomplete assigned routines
  // Advance to next week only when all assigned routines are complete
  useEffect(() => {
    if (!mesocycle || !weeksData || weeksData.length === 0) {
      setCurrentWeekIndex(1);
      return;
    }

    // Find the first week with any incomplete assigned routines (routine_id != null)
    for (let weekIdx = 1; weekIdx <= (mesocycle.weeks || 1); weekIdx++) {
      const weekRoutines = weeksData.filter(w => w.week_index === weekIdx && w.routine_id); 
      
      if (weekRoutines.length === 0) {
        // Week has no assigned routines (all rest), skip it
        continue;
      }
      
      // Check if ALL routines in this week are complete
      // Simply check the is_complete flag - no date calculations needed!
      const allComplete = weekRoutines.every(wr => Boolean(wr.is_complete));
      
      // If not all complete, this is the current week
      if (!allComplete) {
        setAutoCalculatedWeek(weekIdx);
        setCurrentWeekIndex(weekIdx);
        return;
      }
    }
    
    // All weeks are complete, show the last week
    const lastWeek = mesocycle.weeks || 1;
    setAutoCalculatedWeek(lastWeek);
    setCurrentWeekIndex(lastWeek);
  }, [mesocycle, weeksData, sessions, logsMap]);

  // No generate function here — mesocycle renders week assignments directly

  return (
    <div className="mesocycle-detail">
      <SubPageHeader title={mesocycle?.name ?? 'Mesocycle'} backTo="/mesocycles" />
      
      {/* Display month/year based on current week being viewed */}
      {mesocycle?.start_date && (() => {
        try {
          const start = new Date(mesocycle.start_date);
          const weekStart = new Date(start);
          weekStart.setDate(weekStart.getDate() + (currentWeekIndex - 1) * 7);
          return (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-secondary)', 
              fontSize: '0.9rem',
              marginBottom: '0.5rem' 
            }}>
              {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          );
        } catch {
          return null;
        }
      })()}

      {/* Week navigation with date display */}
      <div className="week-nav-container">
        <button 
          className="week-nav-btn" 
          onClick={() => setCurrentWeekIndex(Math.max(1, currentWeekIndex - 1))}
          disabled={currentWeekIndex <= 1}
          title="Previous week">
          ←
        </button>
        
        <div className="date-scroller">
          {(() => {
            // build week dates based on mesocycle.start_date and currentWeekIndex
            const items = [];
            const todayIso = toLocalDateString(new Date());
            
            try {
              if (mesocycle?.start_date) {
                const start = new Date(mesocycle.start_date);
                const weekStart = new Date(start);
                weekStart.setDate(weekStart.getDate() + (currentWeekIndex - 1) * 7);
                
                for (let i = 0; i < 7; i++) {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() + i);
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const daynum = d.getDate();
                  const iso = toLocalDateString(d);
                  items.push({ weekday, daynum, iso });
                }
              } else {
                // Fallback: show week dates based on currentWeekIndex
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay() + (currentWeekIndex - 1) * 7);
                
                for (let i = 0; i < 7; i++) {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const daynum = d.getDate();
                  const iso = toLocalDateString(d);
                  items.push({ weekday, daynum, iso });
                }
              }
            } catch (err) {
              console.error('Error building date scroller:', err);
              // Ultimate fallback: just show day names
              const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              for (let i = 0; i < 7; i++) {
                items.push({ weekday: names[i], daynum: '?', iso: null });
              }
            }
            
            return items.map((it, idx) => (
              <div key={it.iso || `${it.weekday}-${idx}`} className={`date-pill ${it.iso === todayIso ? 'today' : ''}`}>
                <div className="date-weekday">{it.weekday}</div>
                <div className="date-day">{it.daynum}</div>
              </div>
            ));
          })()}
        </div>
        
        <button 
          className="week-nav-btn" 
          onClick={() => setCurrentWeekIndex(Math.min((mesocycle?.weeks || 1), currentWeekIndex + 1))}
          disabled={currentWeekIndex >= (mesocycle?.weeks || 1)}
          title="Next week">
          →
        </button>
      </div>

      

      {weeksData && weeksData.length > 0 && (
        <div className="mesocycle-routines">
          <h4>Week {currentWeekIndex}{currentWeekIndex === autoCalculatedWeek ? ' (current)' : ''}</h4>
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

              // 🔍 COMPREHENSIVE DEBUG LOGGING
              console.log(`===== DAY ${dayIndex} DEBUG =====`);
              console.log('Entry data:', JSON.stringify(entry, null, 2));
              console.log('routineId:', routineId);
              console.log('label:', label);
              console.log('isDeload:', isDeload);
              console.log('Routine found:', routines.find(r => r.id === routineId));
              console.log('===========================');

              // compute scheduled date for this week/day if we have a start date
              let scheduledDateStr = null;
              if (mesocycle && mesocycle.start_date) {
                try {
                  const start = new Date(mesocycle.start_date);
                  const daysToAdd = (currentWeekIndex - 1) * 7 + (dayIndex - 1);
                  const d = new Date(start);
                  d.setDate(d.getDate() + daysToAdd);
                  scheduledDateStr = toLocalDateString(d);
                } catch {
                  scheduledDateStr = null;
                }
              }

              // Check completion directly from the mesocycle_weeks entry
              // No date calculations or logsMap lookups needed!
              const completed = Boolean(entry.is_complete);

              console.log(`Day ${dayIndex} RENDER - Label: "${label}", Completed: ${completed}, RoutineId: ${routineId}`);

              return (
                <div key={dayIndex} className={`routine-card mesocycle-routine-card ${completed ? 'completed' : ''}`} onClick={() => routineId && navigate(`/log-workout/${routineId}?mesocycleWeekId=${entry.id}&returnTo=/mesocycles/${mesocycleId}&date=${scheduledDateStr}`)}>
                  <div className="routine-info">
                    <div className="day-badge">
                      <div className="move-controls">
                        <button className="move-btn" title="Move up" onClick={(ev) => { ev.stopPropagation(); handleMoveDay(dayIndex, -1); }}><ArrowUp size={14} /></button>
                        <button className="move-btn" title="Move down" onClick={(ev) => { ev.stopPropagation(); handleMoveDay(dayIndex, 1); }}><ArrowDown size={14} /></button>
                      </div>
                      <span className="day-label">Day {dayIndex}</span>
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
                        {!completed && (
                          <button 
                            className="action-button skip-button" 
                            onClick={(ev) => { ev.stopPropagation(); handleSkipRoutine(routineId, dayIndex); }} 
                            title="Skip this workout">
                            Skip
                          </button>
                        )}
                        <button className="action-button" onClick={(ev) => { ev.stopPropagation(); navigate(`/workouts/routines/${routineId}`); }} title="Edit">Edit</button>
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
