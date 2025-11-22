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
        const { data, error } = await supabase.functions.invoke('user-has-tag', {
            body: {
                target_user_id: userId,
                tag_name: tagName
            }
        });

        if (error) {
            console.error('Error checking user role:', error);
            return false;
        }

        return data?.has_tag === true;
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

        // Call the Edge Function
        const { data, error } = await supabase.functions.invoke('get-user-tags', {
            body: {
                target_user_id: userId
            }
        });

        if (error) {
            console.error('❌ Edge Function error:', error);
            // Fallback to direct query if Edge Function fails

            return await getUserTagsFallback(userId);
        }

        return data?.tags || [];
    } catch (error) {
        console.error('❌ Error in getUserTags:', error);

        return await getUserTagsFallback(userId);
    }
};

/**
 * Fallback function to get user tags using direct database queries
 */
const getUserTagsFallback = async (userId) => {
    try {

        // Check if user has any user_tags records first
        const { data: userTagsCheck, error: checkError } = await supabase
            .from('user_tags')
            .select('user_id, tag_id')
            .eq('user_id', userId);

        if (checkError) {

            return [];
        }

        if (!userTagsCheck || userTagsCheck.length === 0) {

            return [];
        }

        // First try the join query - using left join instead of inner join
        const { data: joinData, error: joinError } = await supabase
            .from('user_tags')
            .select(`
                tag_id,
                assigned_at,
                assigned_by,
                tags (
                    id,
                    name,
                    description,
                    color
                )
            `)
            .eq('user_id', userId)
            .order('assigned_at', { ascending: false });

        if (!joinError && joinData) {

            // Filter out any null tags and transform to match expected format
            const validTags = joinData
                .filter(item => item.tags) // Only include items with valid tag data
                .map(item => ({
                    tag_id: item.tag_id,
                    tag_name: item.tags.name,
                    tag_description: item.tags.description,
                    tag_color: item.tags.color,
                    assigned_at: item.assigned_at,
                    assigned_by: item.assigned_by
                }));

            return validTags;
        }

        // Fallback to separate queries
        const { data: userTagsData, error: userTagsError } = await supabase
            .from('user_tags')
            .select('*')
            .eq('user_id', userId)
            .order('assigned_at', { ascending: false });

        if (userTagsError) {
            console.error('❌ user_tags query failed:', userTagsError);
            return [];
        }

        if (!userTagsData || userTagsData.length === 0) {

            return [];
        }

        // Get tag details separately
        const tagIds = userTagsData.map(ut => ut.tag_id);
        const { data: tagsData, error: tagsError } = await supabase
            .from('tags')
            .select('*')
            .in('id', tagIds);

        if (tagsError) {
            console.error('❌ tags query failed:', tagsError);
            return [];
        }

        // Combine the data
        const result = userTagsData.map(userTag => {
            const tag = tagsData?.find(t => t.id === userTag.tag_id);
            return {
                tag_id: userTag.tag_id,
                tag_name: tag?.name || 'Unknown Tag',
                tag_description: tag?.description || '',
                tag_color: tag?.color || '#3b82f6',
                assigned_at: userTag.assigned_at,
                assigned_by: userTag.assigned_by
            };
        });

        return result;

    } catch (error) {
        console.error('❌ Error in getUserTags fallback:', error);
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
        if (!user) {

            return [];
        }


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

        const { data, error } = await supabase.functions.invoke('assign-user-tag', {
            body: {
                target_user_id: userId,
                tag_name: tagName,
                assigned_by_user_id: assignedBy
            }
        });

        if (error) {
            console.error('❌ Edge Function error:', error);
            // Fallback to direct query if Edge Function fails

            return await assignUserTagFallback(userId, tagName, assignedBy);
        }

        return data?.success === true;
    } catch (error) {
        console.error('❌ Error in assignUserTag:', error);

        const { data: { user } } = await supabase.auth.getUser();
        const assignedBy = user?.id || null;
        return await assignUserTagFallback(userId, tagName, assignedBy);
    }
};

/**
 * Fallback function to assign user tags using direct database queries
 */
const assignUserTagFallback = async (userId, tagName, assignedBy) => {
    try {

        // First, get the tag ID
        const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

        if (tagError || !tagData) {
            console.error('❌ Error finding tag:', tagError);
            return false;
        }

        // Check if user already has this tag
        const { data: existingTag, error: checkError } = await supabase
            .from('user_tags')
            .select('id')
            .eq('user_id', userId)
            .eq('tag_id', tagData.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found, which is expected
            console.error('❌ Error checking existing tag:', checkError);
            return false;
        }

        // If tag already exists, return true
        if (existingTag) {

            return true;
        }

        // Insert the user tag
        const { error: insertError } = await supabase
            .from('user_tags')
            .insert({
                user_id: userId,
                tag_id: tagData.id,
                assigned_by: assignedBy,
                assigned_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('❌ Error inserting user tag:', insertError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ Error in assignUserTag fallback:', error);
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
        const { data, error } = await supabase.functions.invoke('remove-user-tag', {
            body: {
                target_user_id: userId,
                tag_name: tagName
            }
        });

        if (error) {
            console.error('Error removing user tag:', error);
            return false;
        }

        return data?.success === true;
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
 * @param {string} clientId - UUID of the client (optional if clientEmail provided)
 * @param {string} notes - Optional notes about the relationship
 * @param {string} clientEmail - Email of the client (optional if clientId provided)
 * @returns {Promise<string|null>} Relationship ID if successful, null if failed
 */
export const addClientToTrainer = async (trainerId, clientId, notes = null, clientEmail = null) => {
    try {
        const body = {
            trainer_user_id: trainerId,
            relationship_notes: notes
        };

        // Include either client_user_id or client_email
        if (clientId) {
            body.client_user_id = clientId;
        }
        if (clientEmail) {
            body.client_email = clientEmail;
        }

        const { data, error } = await supabase.functions.invoke('add-client-to-trainer', {
            body
        });

        // Check if the response data contains an error message
        if (data?.error) {
            console.error('❌ Server error:', data.error);
            console.error('❌ Server details:', data.details || 'No additional details');
            return null;
        }

        if (error) {
            console.error('Error adding client to trainer:', error);
            return null;
        }

        return data?.relationship_id || null;
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

        // Direct query with simpler join syntax
        const { data, error } = await supabase
            .from('trainer_clients')
            .select(`
                *,
                user_profiles (
                    id,
                    email,
                    first_name,
                    last_name
                )
            `)
            .eq('trainer_id', trainerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching trainer clients:', error);

            // Fallback: Simple query without joins, then get profile data separately
            const { data: simpleData, error: simpleError } = await supabase
                .from('trainer_clients')
                .select('*')
                .eq('trainer_id', trainerId)
                .order('created_at', { ascending: false });

            if (simpleError) {
                console.error('❌ Simple query also failed:', simpleError);
                return [];
            }

            // Get user profiles separately for each client
            const transformedData = [];
            for (const relationship of simpleData || []) {
                // Get user profile data
                const { data: profileData } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', relationship.client_id)
                    .single();

                transformedData.push({
                    id: `${trainerId}-${relationship.client_id}`,
                    trainer_id: trainerId,
                    client_id: relationship.client_id,
                    status: relationship.status,
                    created_at: relationship.created_at,
                    updated_at: relationship.updated_at,
                    client: {
                        id: relationship.client_id,
                        email: profileData?.email || 'No email found',
                        user_profiles: {
                            full_name: profileData?.first_name && profileData?.last_name
                                ? `${profileData.first_name} ${profileData.last_name}`
                                : profileData?.email?.split('@')[0] || `User ${relationship.client_id.slice(0, 8)}`
                        }
                    },
                    last_message_at: null
                });
            }

            return transformedData;
        }

        // Transform the data to match expected format
        const transformedData = (data || []).map(relationship => ({
            id: `${trainerId}-${relationship.client_id}`,
            trainer_id: trainerId,
            client_id: relationship.client_id,
            status: relationship.status,
            created_at: relationship.created_at,
            updated_at: relationship.updated_at,
            client: {
                id: relationship.client_id,
                email: relationship.user_profiles?.email || `client-${relationship.client_id.slice(0, 8)}@example.com`,
                user_profiles: {
                    full_name: relationship.user_profiles?.first_name && relationship.user_profiles?.last_name
                        ? `${relationship.user_profiles.first_name} ${relationship.user_profiles.last_name}`
                        : relationship.user_profiles?.email?.split('@')[0] || `Client ${relationship.client_id.slice(0, 8)}`
                }
            },
            last_message_at: null // Could be enhanced later
        }));

        return transformedData;
    } catch (error) {
        console.error('❌ Error in getTrainerClients:', error);
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
            .eq('status', 'active')  // Fixed: use 'status' not 'relationship_status'
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching client trainers:', error);
            return [];
        }

        // Get trainer details separately to avoid schema cache issues
        if (data && data.length > 0) {
            const _trainerIds = data.map(rel => rel.trainer_id);

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
                status: status,  // Fixed: use 'status' not 'relationship_status'
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