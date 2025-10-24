/**
 * @file MesocycleDetail.jsx
 * @description Shows a mesocycle summary and its generated sessions (calendar/list view).
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import CycleCalendar from '../components/CycleCalendar.jsx';

function MesocycleDetail() {
  const { id } = useParams();
  const [mesocycle, setMesocycle] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data: m } = await supabase.from('mesocycles').select('*').eq('id', id).maybeSingle();
        setMesocycle(m || null);
        const { data: s } = await supabase.from('cycle_sessions').select('*').eq('mesocycle_id', id).order('scheduled_date', { ascending: true });
        setSessions(s || []);
      } catch (err) {
        console.error('Failed to load mesocycle detail', err.message ?? err);
      }
    })();
  }, [id]);

  const handleGenerate = async () => {
    try {
      const resp = await fetch('/.netlify/functions/generate-cycle-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesocycle_id: id, start_date: mesocycle?.start_date }),
      });
      const json = await resp.json();
      console.log('generate result', json);
      // refresh sessions
      const { data: s } = await supabase.from('cycle_sessions').select('*').eq('mesocycle_id', id).order('scheduled_date', { ascending: true });
      setSessions(s || []);
    } catch (err) {
      console.error('Generate sessions failed', err.message ?? err);
    }
  };

  return (
    <div className="mesocycle-detail">
      <SubPageHeader title={mesocycle?.name ?? 'Mesocycle'} backTo="/mesocycles" />

      {mesocycle && (
        <div className="mesocycle-meta">
          <p>Focus: {mesocycle.focus}</p>
          <p>Weeks: {mesocycle.weeks}</p>
          <p>Start: {mesocycle.start_date || 'TBD'}</p>
        </div>
      )}

      <div className="mesocycle-actions">
        <button className="btn" onClick={handleGenerate}>Generate Sessions</button>
        <Link className="btn" to="/mesocycles">Back</Link>
      </div>

      <h4>Scheduled Sessions</h4>
      <CycleCalendar sessions={sessions} />
    </div>
  );
}

export default MesocycleDetail;
