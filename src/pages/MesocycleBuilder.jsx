/**
 * @file MesocycleBuilder.jsx
 * @description Small form-based builder for creating a mesocycle.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import CycleWeekEditor from '../components/CycleWeekEditor.jsx';

function MesocycleBuilder() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('Hypertrophy');
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState('');

  const handleSave = () => {
    // TODO: persist mesocycle via Supabase and navigate to detail page
    console.log('Save mesocycle', { name, focus, weeks, startDate });
    // For now navigate back to list
    navigate('/mesocycles');
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
