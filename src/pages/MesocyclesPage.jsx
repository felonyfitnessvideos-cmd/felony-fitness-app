/**
 * @file MesocyclesPage.jsx
 * @description List and entry page for user mesocycles (multi-week training blocks).
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';

function MesocyclesPage() {
  // Placeholder state; will be replaced by Supabase fetch in next iteration
  const [mesocycles, setMesocycles] = useState([]);

  useEffect(() => {
    // load mesocycles for the current user via Supabase
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from('mesocycles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (mounted) setMesocycles(data || []);
      } catch (err) {
        console.error('Failed to load mesocycles', err.message ?? err);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="mesocycles-page">
      <SubPageHeader title="Mesocycles" backTo="/workouts" />

      <div className="mesocycles-actions">
        <Link className="btn" to="/mesocycles/new">Create Mesocycle</Link>
      </div>

      <div className="mesocycles-list">
        {mesocycles.length === 0 && <p>No mesocycles yet.</p>}
        {mesocycles.map((m) => (
          <div key={m.id} className="mesocycle-card">
            <h3>{m.name}</h3>
            <p>Focus: {m.focus} — {m.weeks} weeks</p>
            <Link to={`/mesocycles/${m.id}`}>View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MesocyclesPage;
