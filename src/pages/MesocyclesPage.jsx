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
 *
 * Notes
 * - This page is read-only and intentionally uses a lightweight `select('*')`.
 *   If you need to render nested relations later prefer explicit selects and
 *   chained `.order()` calls for multi-column ordering to avoid driver
 *   incompatibilities.
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
 *
 * Audited: 2025-10-25 — JSDoc batch 9
 */

/**
 * MesocyclesPage.jsx
 *
 * Lists a user's mesocycles and provides quick actions (view, edit,
 * duplicate). Cards are full-clickable; this component focuses on
 * presentation and delegates data mutations to page handlers.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import './MesocyclesPage.css';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../useAuth';

function MesocyclesPage() {
  // Placeholder state; will be replaced by Supabase fetch in next iteration
  const [mesocycles, setMesocycles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInactive, setShowInactive] = useState(false);
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

        let query = supabase
          .from('mesocycles')
          .select('*')
          .eq('user_id', user.id);
        
        // Filter by active status unless showing inactive
        if (!showInactive) {
          query = query.or('is_active.eq.true,is_active.is.null');
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

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
  }, [loading, user, showInactive]);

  const handleToggleActive = async (mesocycleId, currentStatus, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('mesocycles')
        .update({ is_active: !currentStatus })
        .eq('id', mesocycleId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh the list
      setMesocycles(prev => prev.map(m => 
        m.id === mesocycleId ? { ...m, is_active: !currentStatus } : m
      ));
    } catch (err) {
      console.error('Failed to toggle mesocycle status:', err);
      alert(`Failed to ${currentStatus ? 'deactivate' : 'activate'} mesocycle: ${err.message}`);
    }
  };

  const handleDelete = async (mesocycleId, mesocycleName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${mesocycleName}"? This will also delete all associated weeks and sessions. This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('mesocycles')
        .delete()
        .eq('id', mesocycleId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Remove from list
      setMesocycles(prev => prev.filter(m => m.id !== mesocycleId));
    } catch (err) {
      console.error('Failed to delete mesocycle:', err);
      alert(`Failed to delete mesocycle: ${err.message}`);
    }
  };

  // Render any fetch error in the UI so the user knows why the list might be empty
  const errorBanner = errorMessage ? <div className="error-message" style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{errorMessage}</div> : null;

  return (
    <div className="mesocycles-page">
      <SubPageHeader title="Mesocycles" backTo="/workouts" />

      <div className="mesocycles-actions">
        <Link className="btn" to="/mesocycles/new">Create Mesocycle</Link>
        <label className="show-inactive-toggle">
          <input 
            type="checkbox" 
            checked={showInactive} 
            onChange={(e) => setShowInactive(e.target.checked)} 
          />
          <span>Show Inactive</span>
        </label>
      </div>

      {errorBanner}
      <div className="mesocycles-list">
        {mesocycles.length === 0 && <p>No mesocycles yet.</p>}
        {mesocycles.map((m) => {
          const isActive = m.is_active !== false; // null or true = active
          return (
            <div key={m.id} className={`mesocycle-card ${!isActive ? 'inactive' : ''}`}>
              <Link
                to={`/mesocycles/${m.id}`}
                className="card-content"
                aria-label={`Open mesocycle ${m.name || 'Untitled Mesocycle'}`}
              >
                <h3>{m.name || 'Untitled Mesocycle'}</h3>
                <p>Focus: {m.focus || 'General'} — {m.weeks ?? 'n/a'} weeks</p>
                {!isActive && <span className="inactive-badge">Inactive</span>}
              </Link>
              <div className="card-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={(e) => handleToggleActive(m.id, isActive, e)}
                  title={isActive ? 'Deactivate' : 'Activate'}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={(e) => handleDelete(m.id, m.name, e)}
                  title="Delete mesocycle"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MesocyclesPage;
