/**
 * @file MesocycleBuilder.jsx
 * @description Small form-based builder for creating a mesocycle.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import CycleWeekEditor from '../components/CycleWeekEditor.jsx';
import { supabase } from '../supabaseClient.js';

function MesocycleBuilder() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('Hypertrophy');
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState('');

  const handleSave = () => {
    (async () => {
      try {
        const { data: created, error } = await supabase.from('mesocycles').insert({ name, focus, weeks, start_date: startDate }).select().single();
        if (error) throw error;
        const mesocycleId = created.id;

        // Create empty week assignments for the mesocycle (day_index left null)
        const weeksInserts = [];
        for (let i = 1; i <= weeks; i++) {
          weeksInserts.push({ mesocycle_id: mesocycleId, week_index: i });
        }
        if (weeksInserts.length > 0) {
          const { error: wkErr } = await supabase.from('mesocycle_weeks').insert(weeksInserts);
          if (wkErr) console.warn('mesocycle weeks insert warning', wkErr.message || wkErr);
        }

        navigate(`/mesocycles/${mesocycleId}`);
      } catch (err) {
        console.error('Failed to save mesocycle', err.message ?? err);
      }
    })();
  };

  return (
    <div className="mesocycle-builder">
      <SubPageHeader title="New Mesocycle" backTo="/mesocycles" />

      <div className="form-row">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
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
        <CycleWeekEditor weeks={weeks} />
      </div>

      <div className="form-actions">
        <button className="btn" onClick={() => navigate('/mesocycles')}>Cancel</button>
        <button className="btn primary" onClick={handleSave}>Save Mesocycle</button>
      </div>
    </div>
  );
}

export default MesocycleBuilder;
