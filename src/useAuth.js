import { useContext } from 'react';
import { AuthContext } from './authContext';

/**
 * Hook to access authentication context
 * @returns {Object} Auth context with session, user, and loading state
 */
export function useAuth() {
  return useContext(AuthContext);
}
