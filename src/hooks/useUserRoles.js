/**
 * @file useUserRoles.js
 * @description React hook for managing user roles and permissions
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * 
 * This hook provides:
 * 1. Real-time role checking
 * 2. Cached role data to prevent excessive API calls
 * 3. Role-based conditional rendering utilities
 * 4. Permission checking functions
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext.jsx';
import userRoleUtils from '../utils/userRoleUtils.js';

/**
 * Custom hook for managing user roles and permissions
 * @returns {Object} Role management functions and state
 */
export const useUserRoles = () => {
    const { user } = useAuth();
    
    // State
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Cached permissions to avoid repeated API calls
    const [permissions, setPermissions] = useState({
        isTrainer: false,
        isClient: false,
        isAdmin: false,
        hasPremium: false,
        isUser: false
    });

    /**
     * Load user roles from the database
     */
    const loadRoles = useCallback(async () => {
        if (!user) {
            setRoles([]);
            setPermissions({
                isTrainer: false,
                isClient: false,
                isAdmin: false,
                hasPremium: false,
                isUser: false
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const userTags = await userRoleUtils.getCurrentUserTags();
            setRoles(userTags);
            
            // Update cached permissions
            const roleNames = userTags.map(tag => tag.tag_name);
            setPermissions({
                isTrainer: roleNames.includes('Trainer'),
                isClient: roleNames.includes('Client'),
                isAdmin: roleNames.includes('Admin'),
                hasPremium: roleNames.includes('Premium'),
                isUser: roleNames.includes('User')
            });
            
        } catch (err) {
            console.error('Error loading user roles:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load roles when user changes
    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    /**
     * Check if user has a specific role
     * @param {string} roleName - Name of the role to check
     * @returns {boolean} True if user has the role
     */
    const hasRole = useCallback((roleName) => {
        return roles.some(role => role.tag_name === roleName);
    }, [roles]);

    /**
     * Check if user has any of the specified roles
     * @param {string[]} roleNames - Array of role names to check
     * @returns {boolean} True if user has any of the roles
     */
    const hasAnyRole = useCallback((roleNames) => {
        return roleNames.some(roleName => hasRole(roleName));
    }, [hasRole]);

    /**
     * Check if user has all of the specified roles
     * @param {string[]} roleNames - Array of role names to check
     * @returns {boolean} True if user has all of the roles
     */
    const hasAllRoles = useCallback((roleNames) => {
        return roleNames.every(roleName => hasRole(roleName));
    }, [hasRole]);

    /**
     * Get the user's primary role for display purposes
     * @returns {string} Primary role name
     */
    const getPrimaryRole = useCallback(() => {
        const rolePriority = ['Admin', 'Trainer', 'Client', 'Premium', 'User'];
        
        for (const priority of rolePriority) {
            if (hasRole(priority)) return priority;
        }
        
        return 'User';
    }, [hasRole]);

    /**
     * Get role color for UI display
     * @param {string} roleName - Name of the role
     * @returns {string} Hex color code
     */
    const getRoleColor = useCallback((roleName) => {
        const role = roles.find(r => r.tag_name === roleName);
        return role?.color || '#3b82f6';
    }, [roles]);

    /**
     * Add a role to the current user
     * @param {string} roleName - Name of the role to add
     * @returns {Promise<boolean>} True if successful
     */
    const addRole = useCallback(async (roleName) => {
        if (!user) return false;
        
        try {
            const success = await userRoleUtils.assignUserTag(user.id, roleName);
            if (success) {
                await loadRoles(); // Refresh roles
            }
            return success;
        } catch (err) {
            console.error('Error adding role:', err);
            setError(err.message);
            return false;
        }
    }, [user, loadRoles]);

    /**
     * Remove a role from the current user
     * @param {string} roleName - Name of the role to remove
     * @returns {Promise<boolean>} True if successful
     */
    const removeRole = useCallback(async (roleName) => {
        if (!user) return false;
        
        try {
            const success = await userRoleUtils.removeUserTag(user.id, roleName);
            if (success) {
                await loadRoles(); // Refresh roles
            }
            return success;
        } catch (err) {
            console.error('Error removing role:', err);
            setError(err.message);
            return false;
        }
    }, [user, loadRoles]);

    /**
     * Refresh roles from the database
     */
    const refreshRoles = useCallback(() => {
        return loadRoles();
    }, [loadRoles]);

    // Return hook interface
    return {
        // State
        roles,
        loading,
        error,
        
        // Permissions (cached for performance)
        permissions,
        
        // Role checking functions
        hasRole,
        hasAnyRole,
        hasAllRoles,
        getPrimaryRole,
        getRoleColor,
        
        // Role management
        addRole,
        removeRole,
        refreshRoles,
        
        // Convenience getters
        get isTrainer() { return permissions.isTrainer; },
        get isClient() { return permissions.isClient; },
        get isAdmin() { return permissions.isAdmin; },
        get hasPremium() { return permissions.hasPremium; },
        get isUser() { return permissions.isUser; },
        
        // Role counts
        get roleCount() { return roles.length; },
        get roleNames() { return roles.map(r => r.tag_name); }
    };
};

// Note: JSX components have been moved to separate files to avoid build issues

export default useUserRoles;