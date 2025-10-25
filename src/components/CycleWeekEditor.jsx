/**
 * @file CycleWeekEditor.jsx
 * @description Small UI to show a grid of weeks and allow assigning routines per week.
 * This is a lightweight placeholder used by the MesocycleBuilder scaffold.
 */

import React, { useEffect, useState } from 'react';
import './CycleWeekEditor.css';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';

// helper: returns true if focus should auto-deload on 5th week
function isDeloadFocus(focus) {
  return focus === 'Strength' || focus === 'Hypertrophy';
}

function CycleWeekEditor({ weeks = 4, focus = 'Hypertrophy', onAssignmentsChange = () => {}, initialAssignments = [] }) {
  const { user, loading } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [assignments, setAssignments] = useState(() => {
    // returns array of { week_index, day_index, type: 'routine'|'rest'|'deload', routine_id }
    return [];
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user || loading) return;
      try {
        const { data, error } = await supabase.from('workout_routines').select('id,routine_name').eq('user_id', user.id).order('routine_name');
        if (error) throw error;
        if (!mounted) return;
        setRoutines(data || []);
      } catch (err) {
        console.error('Failed to load routines', err.message ?? err);
      }
    })();
    return () => { mounted = false; };
  }, [user, loading]);

  // initialize assignments when weeks or focus changes
  useEffect(() => {
    // If initial assignments provided (editing mode), use them when lengths match
    if (initialAssignments && initialAssignments.length > 0) {
      // basic check: expected length
      const expected = weeks * 7;
      if (initialAssignments.length === expected) {
        setAssignments(initialAssignments);
        onAssignmentsChange(initialAssignments);
        return;
      }
    }

    const arr = [];
    const autoDeload = isDeloadFocus(focus);
    for (let w = 1; w <= weeks; w++) {
      const deloadWeek = autoDeload && (w % 5 === 0);
      for (let d = 1; d <= 7; d++) {
        arr.push({ week_index: w, day_index: d, type: deloadWeek ? 'deload' : 'rest', routine_id: null });
      }
    }
    setAssignments(arr);
    onAssignmentsChange(arr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeks, focus, initialAssignments]);

  const handleSelect = (weekIndex, dayIndex, value) => {
    setAssignments((prev) => {
      const next = prev.map((a) => {
        if (a.week_index === weekIndex && a.day_index === dayIndex) {
          if (value === 'rest') return { ...a, type: 'rest', routine_id: null };
          if (value === 'deload') return { ...a, type: 'deload', routine_id: null };
          return { ...a, type: 'routine', routine_id: value };
        }
        return a;
      });
      onAssignmentsChange(next);
      return next;
    });
  };

  const weekArray = Array.from({ length: weeks }, (_, i) => i + 1);

  return (
    <div className="cycle-week-editor">
      <div className="weeks-grid">
        {weekArray.map((w) => {
          const deloadWeek = isDeloadFocus(focus) && (w % 5 === 0);
          return (
            <div key={w} className="week-card">
              <strong>Week {w} {deloadWeek ? '(Deload week)' : ''}</strong>
              <div className="assignments">
                {[1,2,3,4,5,6,7].map((d) => {
                  const idx = assignments.findIndex(a => a.week_index === w && a.day_index === d);
                  const current = idx >= 0 ? assignments[idx] : { type: 'rest', routine_id: null };
                  return (
                    <div key={d} style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem' }}>Day {d}</label>
                      <select
                        value={current.type === 'routine' ? (current.routine_id || '') : current.type}
                        onChange={(e) => handleSelect(w, d, e.target.value)}
                        disabled={deloadWeek}
                      >
                        {deloadWeek && <option value="deload">Deload</option>}
                        {!deloadWeek && (
                          <>
                            <option value="rest">Rest</option>
                            {routines.map((r) => (
                              <option key={r.id} value={r.id}>{r.routine_name}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CycleWeekEditor;
