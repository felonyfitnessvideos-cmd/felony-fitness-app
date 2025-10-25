/**
 * @file MesocyclesPage.jsx
 * @description
 * Page component that lists all mesocycles (multi-week training blocks) for the
 * currently authenticated user and provides an entry point to create a new
 * mesocycle. This component is intentionally lightweight and primarily
 * responsible for fetching and rendering summary information; heavier
 * manipulations (editing, assignment) are delegated to the builder/detail
 * pages.
 *
 * Responsibilities
 * - Fetch mesocycles for the signed-in user from the `mesocycles` table.
 * - Render a list of cards providing quick metadata (name, focus, weeks).
 * - Surface friendly error messaging when the table/migration is missing or
 *   when the fetch fails.
 * - Provide navigation links to view a mesocycle's detail or open its log.
 *
 * Data shapes
 * - mesocycle: { id: string, name?: string, focus?: string, weeks?: number,
 *   start_date?: string, user_id: string, created_at?: string }
 *
 * Side effects & error modes
 * - Uses `supabase` client to query the `mesocycles` table. If the table does
 *   not exist (migration not applied) a helpful message is set in
 *   `errorMessage` to guide the developer/user to apply the migration.
 * - Waits for `useAuth()` to resolve (auth loading) and renders an empty list
 *   for unauthenticated users.
 *
 * Accessibility
 * - Cards are plain semantic HTML with headings and buttons/links; interactive
 *   controls use `<Link>` or `<button>` provided by React Router for keyboard
 *   navigation.
 *
 * Export
 * - Default React component: `MesocyclesPage()`
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import './MesocyclesPage.css';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';

function MesocyclesPage() {
  // Placeholder state; will be replaced by Supabase fetch in next iteration
  const [mesocycles, setMesocycles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, loading } = useAuth();

  useEffect(() => {
    // load mesocycles for the current user via Supabase
    let mounted = true;
    (async () => {
      try {
        // Wait until auth state is known
        if (loading) return;
        if (!user) {
          setMesocycles([]);
          return;
        }

        const { data, error } = await supabase
          .from('mesocycles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (mounted) setMesocycles(data || []);
      } catch (err) {
        const msg = err?.message ?? String(err);
        console.error('Failed to load mesocycles', msg);
        // Surface a friendly error message in the UI for cases like missing table
        setErrorMessage(msg.includes('Could not find the table') ?
          'Mesocycles are not available: the database table is missing. Run the migration to create it in Supabase.' :
          `Failed to load mesocycles: ${msg}`);
      }
    })();
    return () => { mounted = false };
  }, [loading, user]);

  // Render any fetch error in the UI so the user knows why the list might be empty
  const errorBanner = errorMessage ? <div className="error-message" style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{errorMessage}</div> : null;

  return (
    <div className="mesocycles-page">
      <SubPageHeader title="Mesocycles" backTo="/workouts" />

      <div className="mesocycles-actions">
        <Link className="btn" to="/mesocycles/new">Create Mesocycle</Link>
      </div>

      {errorBanner}
      <div className="mesocycles-list">
        {mesocycles.length === 0 && <p>No mesocycles yet.</p>}
        {mesocycles.map((m) => (
          <div key={m.id} className="mesocycle-card">
            <h3>{m.name || 'Untitled Mesocycle'}</h3>
            <p>Focus: {m.focus || 'General'} — {m.weeks ?? 'n/a'} weeks</p>
            <div className="card-actions">
              <Link to={`/mesocycles/${m.id}`}>Open</Link>
              <Link to={`/mesocycles/${m.id}/log`} className="btn small">Open Log</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MesocyclesPage;
