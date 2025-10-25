/**
 * @file MesocycleBuilder.jsx
 * @description
 * Form-driven editor for creating or updating a `mesocycle` template. The
 * builder accepts metadata (name, focus, number of weeks, start date) and a
 * per-week/day assignment structure provided/edited via `CycleWeekEditor`.
 *
 * Responsibilities
 * - Render form fields for mesocycle metadata and a `CycleWeekEditor` to
 *   assemble daily assignments (routine vs rest vs deload).
 * - Persist the mesocycle to the `mesocycles` table and its per-day rows to
 *   `mesocycle_weeks` (one row per week/day). When editing an existing
 *   mesocycle the builder will load and prefill existing rows.
 * - Ensure a `user_profiles` row exists (upsert) prior to inserts to satisfy
 *   FK constraints.
 *
 * Data shapes
 * - Input: form state (name: string, focus: string, weeks: number, start_date?: string)
 * - Week assignment item: { week_index: number, day_index: number, type: string, routine_id?: string }
 *
 * Side effects & error modes
 * - Uses `supabase` for upsert/insert/update/delete operations. Errors from
 *   Supabase are surfaced via `errorMessage` so the UI can show a friendly
 *   explanation (e.g. missing migrations, permission issues).
 * - When saving edits the builder deletes existing `mesocycle_weeks` rows and
 *   re-inserts the current assignments to keep server state in sync with the
 *   editor (simple, idempotent approach).
 *
 * UX considerations
 * - The component performs minimal client validation (non-empty name, weeks
 *   > 0) and disables the Save button while saving.
 * - SuccessModal is shown on successful create/update and navigates to the
 *   detail page for the created mesocycle.
 *
 * Export
 * - Default React component: `MesocycleBuilder()`
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import CycleWeekEditor from '../components/CycleWeekEditor.jsx';
import './MesocycleBuilder.css';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

function MesocycleBuilder() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('Hypertrophy');
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState('');
  const [assignments, setAssignments] = useState([]);
  const { user, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editingMesocycleId = query.get('mesocycleId');

  useEffect(() => {
    // If mesocycleId provided, load existing mesocycle and weeks for editing
    if (!editingMesocycleId) return;
    let mounted = true;
    (async () => {
      try {
        const { data: m, error: mErr } = await supabase.from('mesocycles').select('*').eq('id', editingMesocycleId).maybeSingle();
        if (mErr) throw mErr;
        if (!mounted) return;
        if (m) {
          setName(m.name || '');
          setFocus(m.focus || 'Hypertrophy');
          setWeeks(m.weeks || 4);
          setStartDate(m.start_date || '');
          // load week assignments
          const { data: wdata } = await supabase.from('mesocycle_weeks').select('*').eq('mesocycle_id', editingMesocycleId);
          if (!mounted) return;
          if (wdata && wdata.length > 0) {
            // map rows to assignments format expected by CycleWeekEditor
            const mapped = wdata.map(w => ({ week_index: w.week_index, day_index: w.day_index, type: w.notes === 'rest' || w.notes === 'deload' ? w.notes : (w.routine_id ? 'routine' : 'routine'), routine_id: w.routine_id }));
            setAssignments(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load mesocycle for edit', err?.message ?? err);
      }
    })();
    return () => { mounted = false; };
  }, [editingMesocycleId]);

  const handleSave = () => {
    (async () => {
      try {
        if (loading) return; // wait until auth state resolved
        if (!user) throw new Error('Not authenticated');

        // Basic client-side validation
        if (!name || name.trim().length === 0) {
          setErrorMessage('Please enter a name for the mesocycle.');
          return;
        }
        if (!Number.isInteger(weeks) || weeks < 1) {
          setErrorMessage('Weeks must be a positive integer.');
          return;
        }

        // Ensure a user_profile row exists for this user so foreign key constraints
        // on mesocycles (which reference user_profiles.id) won't fail.
        // Use upsert so this is a no-op if the profile already exists.
        const { error: profileErr } = await supabase.from('user_profiles').upsert({ id: user.id });
        if (profileErr) {
          console.warn('user_profiles upsert warning', profileErr.message || profileErr);
          setErrorMessage('Could not ensure user profile exists: ' + (profileErr.message || String(profileErr)));
          return;
        }

        const payload = {
          name,
          focus,
          weeks,
          start_date: startDate || null,
          user_id: user.id,
        };

        setIsSaving(true);
        let mesocycleId;
        if (editingMesocycleId) {
          // update existing
          const { error: upErr } = await supabase.from('mesocycles').update(payload).eq('id', editingMesocycleId);
          if (upErr) {
            setErrorMessage('Failed to update mesocycle: ' + (upErr.message || String(upErr)));
            setIsSaving(false);
            throw upErr;
          }
          mesocycleId = editingMesocycleId;
        } else {
          const { data: created, error } = await supabase.from('mesocycles').insert(payload).select().single();
          if (error) {
            setErrorMessage('Failed to save mesocycle insert or update: ' + (error.message || String(error)));
            setIsSaving(false);
            throw error;
          }
          mesocycleId = created.id;
        }
  setCreatedId(mesocycleId);

        // Persist week/day assignments. If the CycleWeekEditor provided detailed
        // assignments we persist one row per day; otherwise create simple week rows
        // so the mesocycle has at least one entry per week.
        const toInsert = [];
        if (assignments && assignments.length > 0) {
          for (const a of assignments) {
            toInsert.push({
              mesocycle_id: mesocycleId,
              week_index: a.week_index,
              day_index: a.day_index,
              routine_id: a.type === 'routine' ? a.routine_id : null,
              notes: a.type === 'rest' || a.type === 'deload' ? a.type : null,
            });
          }
        } else {
          for (let i = 1; i <= weeks; i++) {
            toInsert.push({ mesocycle_id: mesocycleId, week_index: i });
          }
        }

        if (toInsert.length > 0) {
          // If editing, remove existing week rows and re-insert to reflect changes
          if (editingMesocycleId) {
            const { error: delErr } = await supabase.from('mesocycle_weeks').delete().eq('mesocycle_id', mesocycleId);
            if (delErr) console.warn('Warning deleting old mesocycle weeks', delErr.message || delErr);
          }
          const { error: wkErr } = await supabase.from('mesocycle_weeks').insert(toInsert);
          if (wkErr) console.warn('mesocycle weeks insert warning', wkErr.message || wkErr);
        }

        setIsSaving(false);
        setSuccessOpen(true);
      } catch (err) {
        console.error('Failed to save mesocycle', err.message ?? err);
      }
    })();
  };

  return (
    <div className="mesocycle-builder">
      <SubPageHeader title={editingMesocycleId ? 'Edit Mesocycle' : 'New Mesocycle'} backTo={editingMesocycleId ? `/mesocycles/${editingMesocycleId}` : '/mesocycles'} />

      <div className="form-row">
        <label>Name</label>
        <input placeholder="e.g. Strength Block - Winter" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Focus</label>
        <select value={focus} onChange={(e) => setFocus(e.target.value)}>
          <option>Hypertrophy</option>
          <option>Strength</option>
          <option>Cut</option>
          <option>Skill</option>
        </select>
      </div>

      <div className="form-row">
        <label>Weeks</label>
        <input type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} />
      </div>

      <div className="form-row">
        <label>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="builder-weeks">
        <h4>Week assignments (draft)</h4>
        <CycleWeekEditor weeks={weeks} focus={focus} initialAssignments={assignments} onAssignmentsChange={(a) => setAssignments(a)} />
      </div>

      {errorMessage && <div className="error-message" style={{ color: 'var(--danger)', marginTop: '0.75rem' }}>{errorMessage}</div>}

      <div className="form-actions">
  <button className="btn" onClick={() => navigate(editingMesocycleId ? `/mesocycles/${editingMesocycleId}` : '/mesocycles')} disabled={isSaving}>Cancel</button>
        <button
          className="btn primary"
          onClick={handleSave}
          disabled={isSaving || loading || !name || name.trim().length === 0 || !Number.isInteger(weeks) || weeks < 1}
          aria-disabled={isSaving || loading || !name || name.trim().length === 0}
        >
          {isSaving ? 'Saving...' : 'Save Mesocycle'}
        </button>
      </div>

      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          if (createdId) navigate(`/mesocycles/${createdId}`);
        }}
        title="Mesocycle saved"
        message="Your mesocycle was created successfully. Click continue to view details."
      />
    </div>
  );
}

export default MesocycleBuilder;
