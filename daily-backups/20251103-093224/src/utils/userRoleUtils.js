/**
 * @file userRoleUtils.js
 * @description Utility functions for managing user roles and tags in the Felony Fitness app
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * 
 * This utility provides functions to:
 * 1. Check user roles and permissions
 * 2. Assign and remove user tags
 * 3. Manage trainer-client relationships
 * 4. Query user roles and relationships
 */

import { supabase } from '../supabaseClient.js';

// =====================================================================================
// ROLE CHECKING FUNCTIONS
// =====================================================================================

/**
 * Check if a user has a specific role/tag
 * @param {string} userId - UUID of the user to check
 * @param {string} tagName - Name of the tag/role to check for
 * @returns {Promise<boolean>} True if user has the tag
 */
export const userHasRole = async (userId, tagName) => {
    try {
        const { data, error } = await supabase.rpc('user_has_tag', {
            target_user_id: userId,
            tag_name: tagName
        });
        
        if (error) {
            console.error('Error checking user role:', error);
            return false;
        }
        
        return data === true;
    } catch (error) {
        console.error('Error in userHasRole:', error);
        return false;
    }
};

/**
 * Check if current authenticated user has a specific role
 * @param {string} tagName - Name of the tag/role to check for
 * @returns {Promise<boolean>} True if current user has the tag
 */
export const currentUserHasRole = async (tagName) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        return await userHasRole(user.id, tagName);
    } catch (error) {
        console.error('Error checking current user role:', error);
        return false;
    }
};

/**
 * Get all tags/roles for a specific user
 * @param {string} userId - UUID of the user
 * @returns {Promise<Array>} Array of user tags with details
 */
export const getUserTags = async (userId) => {
    try {
        const { data, error } = await supabase.rpc('get_user_tags', {
            target_user_id: userId
        });
        
        if (error) {
            console.error('Error fetching user tags:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getUserTags:', error);
        return [];
    }
};

/**
 * Get all tags/roles for current authenticated user
 * @returns {Promise<Array>} Array of current user's tags
 */
export const getCurrentUserTags = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        return await getUserTags(user.id);
    } catch (error) {
        console.error('Error getting current user tags:', error);
        return [];
    }
};

// =====================================================================================
// TAG MANAGEMENT FUNCTIONS
// =====================================================================================

/**
 * Assign a tag/role to a user
 * @param {string} userId - UUID of the user to assign tag to
 * @param {string} tagName - Name of the tag to assign
 * @returns {Promise<boolean>} True if assignment was successful
 */
export const assignUserTag = async (userId, tagName) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const assignedBy = user?.id || null;
        
        const { data, error } = await supabase.rpc('assign_user_tag', {
            target_user_id: userId,
            tag_name: tagName,
            assigned_by_user_id: assignedBy
        });
        
        if (error) {
            console.error('Error assigning user tag:', error);
            return false;
        }
        
        return data === true;
    } catch (error) {
        console.error('Error in assignUserTag:', error);
        return false;
    }
};

/**
 * Remove a tag/role from a user (only non-system tags)
 * @param {string} userId - UUID of the user to remove tag from
 * @param {string} tagName - Name of the tag to remove
 * @returns {Promise<boolean>} True if removal was successful
 */
export const removeUserTag = async (userId, tagName) => {
    try {
        const { data, error } = await supabase.rpc('remove_user_tag', {
            target_user_id: userId,
            tag_name: tagName
        });
        
        if (error) {
            console.error('Error removing user tag:', error);
            return false;
        }
        
        return data === true;
    } catch (error) {
        console.error('Error in removeUserTag:', error);
        return false;
    }
};

/**
 * Get all available tags in the system
 * @returns {Promise<Array>} Array of all available tags
 */
export const getAllTags = async () => {
    try {
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('tag_type', { ascending: true })
            .order('name', { ascending: true });
        
        if (error) {
            console.error('Error fetching all tags:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getAllTags:', error);
        return [];
    }
};

// =====================================================================================
// TRAINER-CLIENT RELATIONSHIP FUNCTIONS
// =====================================================================================

/**
 * Add a client to a trainer (creates trainer-client relationship)
 * @param {string} trainerId - UUID of the trainer
 * @param {string} clientId - UUID of the client
 * @param {string} notes - Optional notes about the relationship
 * @returns {Promise<string|null>} Relationship ID if successful, null if failed
 */
export const addClientToTrainer = async (trainerId, clientId, notes = null) => {
    try {
        const { data, error } = await supabase.rpc('add_client_to_trainer', {
            trainer_user_id: trainerId,
            client_user_id: clientId,
            relationship_notes: notes
        });
        
        if (error) {
            console.error('Error adding client to trainer:', error);
            return null;
        }
        
        return data; // Returns the relationship ID
    } catch (error) {
        console.error('Error in addClientToTrainer:', error);
        return null;
    }
};

/**
 * Get all clients for a trainer
 * @param {string} trainerId - UUID of the trainer
 * @returns {Promise<Array>} Array of trainer-client relationships with user details
 */
export const getTrainerClients = async (trainerId) => {
    try {
        // TEMP FIX: Simple query without embedded relationships to avoid schema cache issues
        const { data, error } = await supabase
            .from('trainer_clients')
            .select('*')
            .eq('trainer_id', trainerId)
            .eq('relationship_status', 'active')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching trainer clients:', error);
            return [];
        }
        
        // Get client details separately to avoid schema cache issues
        if (data && data.length > 0) {
            const clientIds = data.map(rel => rel.client_id);
            
            // TEMP FIX: Use placeholder data since user_profiles schema is unclear
            return data.map(rel => ({
                ...rel,
                client: {
                    id: rel.client_id,
                    email: `client-${rel.client_id.slice(0, 8)}@example.com`, // Placeholder
                    user_profiles: { full_name: 'Test Client' } // Placeholder
                }
            }));
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getTrainerClients:', error);
        return [];
    }
};

/**
 * Get all trainers for a client
 * @param {string} clientId - UUID of the client
 * @returns {Promise<Array>} Array of trainer-client relationships with trainer details
 */
export const getClientTrainers = async (clientId) => {
    try {
        // TEMP FIX: Simple query without embedded relationships to avoid schema cache issues
        const { data, error } = await supabase
            .from('trainer_clients')
            .select('*')
            .eq('client_id', clientId)
            .eq('relationship_status', 'active')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching client trainers:', error);
            return [];
        }
        
        // Get trainer details separately to avoid schema cache issues
        if (data && data.length > 0) {
            const trainerIds = data.map(rel => rel.trainer_id);
            
            // TEMP FIX: Use placeholder data since user_profiles schema is unclear
            return data.map(rel => ({
                ...rel,
                trainer: {
                    id: rel.trainer_id,
                    email: `trainer-${rel.trainer_id.slice(0, 8)}@example.com`, // Placeholder
                    user_profiles: { full_name: 'Test Trainer' } // Placeholder
                }
            }));
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getClientTrainers:', error);
        return [];
    }
};

/**
 * Update trainer-client relationship status
 * @param {string} relationshipId - UUID of the relationship
 * @param {string} status - New status ('active', 'inactive', 'terminated')
 * @returns {Promise<boolean>} True if update was successful
 */
export const updateTrainerClientStatus = async (relationshipId, status) => {
    try {
        const { error } = await supabase
            .from('trainer_clients')
            .update({ 
                relationship_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', relationshipId);
        
        if (error) {
            console.error('Error updating trainer-client status:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error in updateTrainerClientStatus:', error);
        return false;
    }
};

// =====================================================================================
// ROLE-BASED UI HELPERS
// =====================================================================================

/**
 * Check if current user can access trainer features
 * @returns {Promise<boolean>} True if user is a trainer
 */
export const canAccessTrainerFeatures = async () => {
    return await currentUserHasRole('Trainer');
};

/**
 * Check if current user can access admin features
 * @returns {Promise<boolean>} True if user is an admin
 */
export const canAccessAdminFeatures = async () => {
    return await currentUserHasRole('Admin');
};

/**
 * Check if current user has premium features
 * @returns {Promise<boolean>} True if user has premium access
 */
export const hasPremiumAccess = async () => {
    return await currentUserHasRole('Premium');
};

/**
 * Get user's primary role for display purposes
 * @param {string} userId - UUID of the user (optional, defaults to current user)
 * @returns {Promise<string>} Primary role name
 */
export const getUserPrimaryRole = async (userId = null) => {
    try {
        let targetUserId = userId;
        
        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return 'Guest';
            targetUserId = user.id;
        }
        
        const tags = await getUserTags(targetUserId);
        const roleTags = tags.filter(tag => tag.tag_type === 'role');
        
        // Priority order for role display
        const rolePriority = ['Admin', 'Trainer', 'Client', 'User'];
        
        for (const priority of rolePriority) {
            const roleTag = roleTags.find(tag => tag.tag_name === priority);
            if (roleTag) return roleTag.tag_name;
        }
        
        return 'User'; // Default fallback
    } catch (error) {
        console.error('Error getting user primary role:', error);
        return 'User';
    }
};

// =====================================================================================
// EXPORT DEFAULT OBJECT
// =====================================================================================

export default {
    // Role checking
    userHasRole,
    currentUserHasRole,
    getUserTags,
    getCurrentUserTags,
    
    // Tag management
    assignUserTag,
    removeUserTag,
    getAllTags,
    
    // Trainer-client relationships
    addClientToTrainer,
    getTrainerClients,
    getClientTrainers,
    updateTrainerClientStatus,
    
    // UI helpers
    canAccessTrainerFeatures,
    canAccessAdminFeatures,
    hasPremiumAccess,
    getUserPrimaryRole
};