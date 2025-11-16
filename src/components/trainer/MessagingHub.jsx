/**
 * @file MessagingHub.jsx
 * @description Trainer email messaging hub with group tags and client management
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @date 2025-11-16
 * 
 * Features:
 * - Left side: Orange group tag buttons for quick access
 * - Right side: Create new groups + client list with Add/Added buttons
 * - Click group button → Opens email composer modal
 * - Inline group creation (no modal needed)
 * - Simple client tagging workflow
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../supabaseClient';
import EmailComposerModal from './EmailComposerModal';
import './MessagingHub.css';

/**
 * MessagingHub Component
 * 
 * @component
 * @returns {JSX.Element} Complete messaging hub interface
 */
const MessagingHub = () => {
  const { user } = useAuth();

  // State management
  const [groupTags, setGroupTags] = useState([]);
  const [clients, setClients] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState([]); // For group creation
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load trainer's group tags and clients on mount
   */
  useEffect(() => {
    if (!user?.id) {
      setLoading(false); // Prevent stuck loading if no authenticated user
      return;
    }
    
    // Load both immediately
    const initializeData = async () => {
      await Promise.all([
        loadGroupTags(),
        loadClients()
      ]);
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /**
   * Fetch all group tags for this trainer
   */
  const loadGroupTags = async () => {
    try {
      const { data, error } = await supabase
        .from('trainer_group_tags')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGroupTags(data || []);
    } catch (err) {
      console.error('Error loading group tags:', err);
      setError('Failed to load groups');
    }
  };

  /**
   * Fetch all clients for this trainer
   */
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null); // Clear stale error before retry
      
      // Direct query to get clients with tags field
      // Exclude unsubscribed clients from messaging UI
      const { data, error } = await supabase
        .from('trainer_clients')
        .select(`
          client_id,
          tags,
          full_name,
          email,
          status
        `)
        .eq('trainer_id', user.id)
        .eq('status', 'active')
        .eq('is_unsubscribed', false)
        .order('full_name', { ascending: true });

      if (error) throw error;

      // Format clients for UI
      const formattedClients = (data || []).map(client => ({
        id: client.client_id,
        name: client.full_name || client.email?.split('@')[0] || 'Unknown Client',
        email: client.email || '',
        tags: client.tags || [] // Array of tag IDs
      }));

      setClients(formattedClients);
      console.log('✅ Loaded clients:', formattedClients);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new group tag with selected clients
   */
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedClientIds.length === 0) {
      alert('Please select at least one client for this group');
      return;
    }

    try {
      // Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from('trainer_group_tags')
        .insert({
          trainer_id: user.id,
          name: newGroupName.trim()
        })
        .select()
        .single();

      if (groupError) {
        if (groupError.code === '23505') {
          alert('A group with this name already exists');
        } else {
          throw groupError;
        }
        return;
      }

      // Add all selected clients to this group
      // OPTIMIZATION: For large groups, consider moving this to a Postgres function
      // that uses array_append(tags, newGroup.id) in a single UPDATE WHERE client_id IN (...)
      // to avoid N queries and prevent overwrites if another process updates tags concurrently
      for (const clientId of selectedClientIds) {
        const client = clients.find(c => c.id === clientId);
        if (!client) continue;

        const { error: updateError } = await supabase
          .from('trainer_clients')
          .update({
            tags: [...(client.tags || []), newGroup.id]
          })
          .eq('client_id', clientId)
          .eq('trainer_id', user.id);

        if (updateError) console.error('Error adding client to group:', updateError);
      }

      // Update local state
      setGroupTags([...groupTags, newGroup]);
      setClients(clients.map(c => 
        selectedClientIds.includes(c.id)
          ? { ...c, tags: [...(c.tags || []), newGroup.id] }
          : c
      ));
      
      // Reset form
      setNewGroupName('');
      setSelectedClientIds([]);
      
      console.log('✅ Group created with clients:', newGroup.name);
      alert(`Group "${newGroup.name}" created with ${selectedClientIds.length} client(s)!`);
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group. Please try again.');
    }
  };

  /**
   * Toggle client selection for group creation
   */
  const handleToggleClientSelection = (clientId) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  /**
   * Open email composer for selected group (click group button)
   */
  const handleOpenComposer = (tag) => {
    const tagClients = clients.filter(c => c.tags.includes(tag.id));
    if (tagClients.length === 0) {
      alert('This group has no clients. Add clients first.');
      return;
    }
    setSelectedTag(tag);
    setIsComposerOpen(true);
  };

  /**
   * Memoized map of tag ID to client count
   * Prevents repeated filtering through clients array on every render
   */
  const tagClientCounts = useMemo(() => {
    const counts = {};
    groupTags.forEach(tag => {
      counts[tag.id] = clients.filter(c => c.tags.includes(tag.id)).length;
    });
    return counts;
  }, [clients, groupTags]);

  /**
   * Get count of clients with specific tag (uses memoized map)
   */
  const getTagClientCount = (tagId) => {
    return tagClientCounts[tagId] || 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="messaging-hub-workspace">
        <div className="loading-message">Loading messaging hub...</div>
      </div>
    );
  }

  return (
    <div className="messaging-hub-workspace">
      {/* Card 1: Email Groups */}
      <div className="group-tags-section">
        <div className="group-tags-header">
          <h3>Groups</h3>
        </div>
        <div className="group-tags-container">
          {groupTags.length === 0 ? (
            <div className="no-groups-message">
              <p>No groups yet. Create one below →</p>
            </div>
          ) : (
            groupTags.map(tag => (
              <button
                key={tag.id}
                className="group-tag-button"
                onClick={() => handleOpenComposer(tag)}
                title={`Click to email ${getTagClientCount(tag.id)} client(s)`}
              >
                <span>{tag.name}</span>
                <span className="tag-count">({getTagClientCount(tag.id)})</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Card 2: Create Group */}
      <div className="create-group-section">
        <div className="create-group-header">
          <h3>Create Group</h3>
        </div>
        <div className="create-group-input-area">
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            className="new-group-input"
          />
          <div className="selected-count">
            {selectedClientIds.length} client(s) selected
          </div>
          <button 
            onClick={handleCreateGroup}
            className="create-group-btn"
            disabled={!newGroupName.trim() || selectedClientIds.length === 0}
          >
            Create Group
          </button>
        </div>
      </div>

      {/* Card 3: Client List */}
      <div className="client-list-panel">
        <div className="client-list-header">
          <h3>Clients</h3>
        </div>

        {clients.length === 0 ? (
          <div className="no-clients-message">
            <p>No clients found.</p>
            <p>Add clients through the Client Onboarding tool.</p>
          </div>
        ) : (
          <div className="client-list-items">
            {clients.map(client => (
              <div key={client.id} className="client-list-item">
                <span className="client-name">{client.name}</span>
                <button
                  className={`add-client-btn ${selectedClientIds.includes(client.id) ? 'selected' : ''}`}
                  onClick={() => handleToggleClientSelection(client.id)}
                >
                  {selectedClientIds.includes(client.id) ? 'Selected' : '+Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      {isComposerOpen && selectedTag && (
        <EmailComposerModal
          tag={selectedTag}
          clients={clients.filter(c => c.tags.includes(selectedTag.id))}
          onClose={() => {
            setIsComposerOpen(false);
            setSelectedTag(null);
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default MessagingHub;
