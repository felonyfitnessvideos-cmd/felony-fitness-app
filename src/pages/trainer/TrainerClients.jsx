
/**
 * @file TrainerClients.jsx
 * @description Comprehensive client management interface for trainers
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @project Felony Fitness
 *
 * This component provides a streamlined client management system that serves as the foundation
 * for core trainer tools including scheduling, progress tracking, messaging, and program management.
 *
 * Features:
 * - Real-time client search by name or email
 * - Comprehensive client cards with contact info, programs, and appointments
 * - Detailed client modal with full profile information
 * - Responsive design for all device sizes
 * - Progress tracking and payment status monitoring
 *
 * @requires react
 * @requires lucide-react
 * @requires ./TrainerClients.css
 */

import { Activity, Calendar, Mail, Phone, Search, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateClientNotes } from '../../services/trainerService.js';
import { useAuth } from '../../AuthContext.jsx';
import { supabase } from '../../supabaseClient.js';
import './TrainerClients.css';

/**
 * TrainerClients Component
 * 
 * Main component for managing trainer's client list with search, filtering, and detailed view capabilities.
 * Provides a clean, professional interface for client management that serves as the foundation for
 * all core trainer tools. 
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClientSelect - Callback when a client is selected/expanded
 * @returns {JSX.Element} The complete client management interface
 * 
 * @example
 */


export function TrainerClients({ onClientSelect }) {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientNotes, setClientNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
    const [clientMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch clients for this trainer
    useEffect(() => {
        const fetchClients = async () => {
            console.log('[TrainerClients] useEffect: user', user);
            if (!user?.id) {
                console.log('[TrainerClients] No user ID, skipping fetch.');
                setClients([]);
                setFilteredClients([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                console.log('[TrainerClients] Fetching clients for trainer_id:', user.id);
                const { data, error } = await supabase
                    .from('trainer_clients')
                    .select(`
                        id,
                        client_id,
                        full_name,
                        created_at,
                        notes,
                        status
                    `)
                    .eq('trainer_id', user.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                console.log('[TrainerClients] Supabase response:', { data, error });
                if (error) throw error;
                // Map DB fields to UI fields for consistency
                const mapped = (data || []).map(row => ({
                    relationshipId: row.id,
                    clientId: row.client_id,
                    name: row.full_name,
                    joinDate: row.created_at,
                    notes: row.notes,
                    status: row.status
                }));
                console.log('[TrainerClients] Mapped clients:', mapped);
                setClients(mapped);
                setFilteredClients(mapped);
            } catch (err) {
                console.error('[TrainerClients] Failed to load clients:', err);
                setError('Failed to load clients');
                setClients([]);
                setFilteredClients([]);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, [user]);

  // Filter clients by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(clients);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredClients(
        clients.filter(c =>
          (c.name && c.name.toLowerCase().includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, clients]);

    return (
        <div className="trainer-clients">
            <div className="search-section">
                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button
                    type="button"
                    className="new-client-btn"
                    onClick={() => navigate('/trainer-dashboard/onboarding')}
                    aria-label="Add New Client"
                >
                    <UserPlus size={20} />
                    <span>New Client</span>
                </button>
            </div>
            <div className="clients-grid">
                {loading ? (
                    <div className="no-clients"><p>Loading clients...</p></div>
                ) : error ? (
                    <div className="no-clients"><p>{error}</p></div>
                ) : filteredClients.length === 0 ? (
                    <div className="no-clients">
                        <p>No clients found matching your search.</p>
                        {clients.length === 0 && (
                            <p>You haven't added any clients yet. Use the Client Onboarding tool to add new clients.</p>
                        )}
                    </div>
                ) : (
                    filteredClients.map(client => {
                        const isExpanded = expandedClient === client.relationshipId;
                        return (
                            <div
                                key={client.clientId}
                                className={`client-card${isExpanded ? ' expanded' : ''}`}
                            >
                                <div className="client-card-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                                        <button
                                            className="expand-toggle-btn"
                                            aria-label={isExpanded ? 'Collapse client details' : 'Expand client details'}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setExpandedClient(isExpanded ? null : client.relationshipId);
                                                if (onClientSelect) onClientSelect(!isExpanded ? client : null);
                                            }}
                                            style={{background:'none',border:'none',cursor:'pointer',padding:0,marginRight:4}}
                                        >
                                            <span style={{display:'inline-block',transition:'transform 0.2s',transform:isExpanded?'rotate(90deg)':'rotate(0deg)'}}>
                                                ▶
                                            </span>
                                        </button>
                                        <h3 style={{margin:0}}>{client.name}</h3>
                                    </div>
                                    <button
                                        className="message-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/trainer-dashboard/messages?client=${client.clientId}`);
                                        }}
                                    >
                                        <Mail size={16} />
                                        Message
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="client-details-expanded" onClick={e => e.stopPropagation()}>
                                        <div className="info-section">
                                            <h4>Contact Information</h4>
                                            <div className="info-row">
                                                <Mail size={16} />
                                                <span>{client.email}</span>
                                            </div>
                                            <div className="info-row">
                                                <Phone size={16} />
                                                <span>{client.phone}</span>
                                            </div>
                                        </div>
                                        <div className="info-section">
                                            <h4>Profile Details</h4>
                                            <div className="info-row">
                                                <Calendar size={16} />
                                                <span>Joined: {client.joinDate}</span>
                                            </div>
                                            {client.dateOfBirth && (
                                                <div className="info-row">
                                                    <Activity size={16} />
                                                    <span>DOB: {client.dateOfBirth}</span>
                                                </div>
                                            )}
                                            {client.fitnessGoals && (
                                                <div className="info-row">
                                                    <Activity size={16} />
                                                    <span>Goals: {client.fitnessGoals}</span>
                                                </div>
                                            )}
                                        </div>
                                        {client.medicalConditions && (
                                            <div className="info-section">
                                                <h4>Medical Information</h4>
                                                <p>{client.medicalConditions}</p>
                                            </div>
                                        )}
                                        {client.emergencyContact && (
                                            <div className="info-section">
                                                <h4>Emergency Contact</h4>
                                                <div className="info-row">
                                                    <Phone size={16} />
                                                    <span>{client.emergencyContact} - {client.emergencyPhone}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="info-section">
                                            <h4>Client Stats</h4>
                                            {clientMetrics && Object.keys(clientMetrics).length > 0 ? (
                                                <div className="stats-list">
                                                    {Object.entries(clientMetrics).map(([key, val]) => (
                                                        <div className="stat-row" key={key}>
                                                            <strong>{key}:</strong>
                                                            <span style={{marginLeft:8}}>
                                                                {typeof val === 'object' && val !== null ? (
                                                                    <>
                                                                        {Object.entries(val).filter(([k]) => k !== 'lastUpdated').map(([k, v]) => (
                                                                            <span key={k} style={{display:'block'}}>
                                                                                <strong style={{fontWeight:400}}>{k}:</strong> {String(v)}
                                                                            </span>
                                                                        ))}
                                                                        <span style={{fontSize:'0.85em',color:'#888'}}>Last updated: {val.lastUpdated ? new Date(val.lastUpdated).toLocaleString() : 'N/A'}</span>
                                                                    </>
                                                                ) : String(val)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-stats">No metrics available.</div>
                                            )}
                                        </div>
                                        <div className="info-section">
                                            <h4>Trainer Notes</h4>
                                            <textarea
                                                className="notes-textarea"
                                                value={clientNotes}
                                                onChange={(e) => setClientNotes(e.target.value)}
                                                placeholder="Add notes about this client (injuries, preferences, progress cues)..."
                                                onClick={e => e.stopPropagation()}
                                            />
                                            <div style={{display:'flex', gap:8, marginTop:8}}>
                                                <button
                                                    className="save-notes-btn"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!client.relationshipId) return;
                                                        try {
                                                            setNotesSaving(true);
                                                            await updateClientNotes(client.relationshipId, clientNotes || null);
                                                        } catch (err) {
                                                            console.error('Failed to save notes', err);
                                                        } finally {
                                                            setNotesSaving(false);
                                                        }
                                                    }}
                                                    disabled={notesSaving}
                                                >
                                                    {notesSaving ? 'Saving...' : 'Save Notes'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default TrainerClients;
