/**
 * @file useUserRoles.ts
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
import { useAuth } from '../useAuth';
import { supabase } from '../supabaseClient';
import userRoleUtils from '../utils/userRoleUtils';

/**
 * Permissions object interface
 */
interface Permissions {
  isTrainer: boolean;
  isClient: boolean;
  isAdmin: boolean;
  hasPremium: boolean;
  isUser: boolean;
}

/**
 * Role object from database
 */
interface Role {
  tag_name: string;
  color?: string;
}

/**
 * Return type for useUserRoles hook
 */
interface UseUserRolesReturn {
  // State
  roles: Role[];
  loading: boolean;
  error: string | null;
  
  // Permissions (cached for performance)
  permissions: Permissions;
  
  // Role checking functions
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  getPrimaryRole: () => string;
  getRoleColor: (roleName: string) => string;
  
  // Role management
  addRole: (roleName: string) => Promise<boolean>;
  removeRole: (roleName: string) => Promise<boolean>;
  refreshRoles: () => Promise<void>;
  
  // Convenience getters
  isTrainer: boolean;
  isClient: boolean;
  isAdmin: boolean;
  hasPremium: boolean;
  isUser: boolean;
  
  // Role counts
  roleCount: number;
  roleNames: string[];
}

/**
 * Custom hook for managing user roles and permissions
 * @returns {UseUserRolesReturn} Role management functions and state
 */
export const useUserRoles = (): UseUserRolesReturn => {
    const { user } = useAuth();
    
    // State
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Cached permissions to avoid repeated API calls
    const [permissions, setPermissions] = useState<Permissions>({
        isTrainer: false,
        isClient: false,
        isAdmin: false,
        hasPremium: false,
        isUser: false
    });

    /**
     * Load user roles from the database
     * Note: is_admin and is_trainer are stored as booleans in user_profiles table
     * user_tags is a separate system for email/admin console functionality
     */
    const loadRoles = useCallback(async (): Promise<void> => {
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
            
            // Get user profile with role flags
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('is_admin, is_trainer')
                .eq('id', user.id)
                .single();
            
            if (profileError) throw profileError;
            
            // Build roles array from boolean flags
            const userRoles: Role[] = [];
            if (profile?.is_admin) userRoles.push({ tag_name: 'Admin' });
            if (profile?.is_trainer) userRoles.push({ tag_name: 'Trainer' });
            
            setRoles(userRoles);
            
            // Update cached permissions
            setPermissions({
                isTrainer: profile?.is_trainer || false,
                isClient: false, // Not stored in DB yet
                isAdmin: profile?.is_admin || false,
                hasPremium: false, // Not implemented yet
                isUser: true
            });
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error loading user roles:', err);
            setError(errorMessage);
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
    const hasRole = useCallback((roleName: string): boolean => {
        return roles.some(role => role.tag_name === roleName);
    }, [roles]);

    /**
     * Check if user has any of the specified roles
     * @param {string[]} roleNames - Array of role names to check
     * @returns {boolean} True if user has any of the roles
     */
    const hasAnyRole = useCallback((roleNames: string[]): boolean => {
        return roleNames.some(roleName => hasRole(roleName));
    }, [hasRole]);

    /**
     * Check if user has all of the specified roles
     * @param {string[]} roleNames - Array of role names to check
     * @returns {boolean} True if user has all of the roles
     */
    const hasAllRoles = useCallback((roleNames: string[]): boolean => {
        return roleNames.every(roleName => hasRole(roleName));
    }, [hasRole]);

    /**
     * Get the user's primary role for display purposes
     * @returns {string} Primary role name
     */
    const getPrimaryRole = useCallback((): string => {
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
    const getRoleColor = useCallback((roleName: string): string => {
        const role = roles.find(r => r.tag_name === roleName);
        return role?.color || '#3b82f6';
    }, [roles]);

    /**
     * Add a role to the current user
     * @param {string} roleName - Name of the role to add
     * @returns {Promise<boolean>} True if successful
     */
    const addRole = useCallback(async (roleName: string): Promise<boolean> => {
        if (!user) return false;
        
        try {
            const success = await userRoleUtils.assignUserTag(user.id, roleName);
            if (success) {
                await loadRoles(); // Refresh roles
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error adding role:', err);
            setError(errorMessage);
            return false;
        }
    }, [user, loadRoles]);

    /**
     * Remove a role from the current user
     * @param {string} roleName - Name of the role to remove
     * @returns {Promise<boolean>} True if successful
     */
    const removeRole = useCallback(async (roleName: string): Promise<boolean> => {
        if (!user) return false;
        
        try {
            const success = await userRoleUtils.removeUserTag(user.id, roleName);
            if (success) {
                await loadRoles(); // Refresh roles
            }
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error removing role:', err);
            setError(errorMessage);
            return false;
        }
    }, [user, loadRoles]);

    /**
     * Refresh roles from the database
     */
    const refreshRoles = useCallback(async (): Promise<void> => {
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
        isTrainer: permissions.isTrainer,
        isClient: permissions.isClient,
        isAdmin: permissions.isAdmin,
        hasPremium: permissions.hasPremium,
        isUser: permissions.isUser,
        
        // Role counts
        roleCount: roles.length,
        roleNames: roles.map(r => r.tag_name)
    };
};

export default useUserRoles;
