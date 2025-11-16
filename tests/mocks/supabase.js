/**
 * @fileoverview Mock Supabase client for testing
 * @description Provides a reusable mock Supabase client with proper cleanup
 * to prevent memory leaks and test interference.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-15
 */

import { vi } from 'vitest';

/**
 * Creates a mock Supabase client with cleanup capabilities
 * 
 * @returns {Object} Mock Supabase client with __cleanup method
 * 
 * @example
 * import { createMockSupabase } from '@tests/mocks/supabase';
 * 
 * let mockSupabase;
 * 
 * beforeEach(() => {
 *   mockSupabase = createMockSupabase();
 *   vi.mock('../supabaseClient', () => ({
 *     default: mockSupabase,
 *     supabase: mockSupabase
 *   }));
 * });
 * 
 * afterEach(() => {
 *   mockSupabase.__cleanup();
 * });
 */
export const createMockSupabase = () => {
  // Track subscriptions and callbacks for cleanup
  const subscriptions = [];
  const authCallbacks = [];
  const channels = [];

  /**
   * Mock database query builder
   * Returns chainable mock methods for Supabase queries
   */
  const createQueryBuilder = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: vi.fn((resolve) => resolve({ data: [], error: null }))
  });

  const mockSupabase = {
    /**
     * Mock database table access
     * @param {string} table - Table name
     * @returns {Object} Query builder
     */
    from: vi.fn((table) => createQueryBuilder()),

    /**
     * Mock authentication methods
     */
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com',
            user_metadata: {}
          } 
        }, 
        error: null 
      })),
      
      getSession: vi.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user-id',
              email: 'test@example.com'
            },
            access_token: 'mock-token'
          } 
        }, 
        error: null 
      })),
      
      onAuthStateChange: vi.fn((callback) => {
        authCallbacks.push(callback);
        const unsubscribe = vi.fn(() => {
          const index = authCallbacks.indexOf(callback);
          if (index > -1) {
            authCallbacks.splice(index, 1);
          }
        });
        return {
          data: { 
            subscription: { 
              unsubscribe 
            } 
          }
        };
      }),
      
      signInWithPassword: vi.fn(() => Promise.resolve({ 
        data: { 
          user: { id: 'test-user-id' }, 
          session: { access_token: 'mock-token' } 
        }, 
        error: null 
      })),
      
      signUp: vi.fn(() => Promise.resolve({ 
        data: { 
          user: { id: 'test-user-id' }, 
          session: { access_token: 'mock-token' } 
        }, 
        error: null 
      })),
      
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
      
      updateUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    },

    /**
     * Mock realtime channel
     * @param {string} name - Channel name
     * @returns {Object} Channel mock
     */
    channel: vi.fn((name) => {
      const channel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn((callback) => {
          if (callback) callback('SUBSCRIBED');
          const unsubscribe = vi.fn();
          subscriptions.push(unsubscribe);
          return unsubscribe;
        }),
        unsubscribe: vi.fn(() => Promise.resolve({ error: null }))
      };
      channels.push(channel);
      return channel;
    }),

    /**
     * Mock storage bucket access
     */
    storage: {
      from: vi.fn((bucket) => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        remove: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } }))
      }))
    },

    /**
     * Mock RPC function calls
     * @param {string} fn - Function name
     * @param {Object} params - Function parameters
     * @returns {Promise} Mock response
     */
    rpc: vi.fn((fn, params) => Promise.resolve({ data: null, error: null })),

    /**
     * Remove all channels (cleanup helper)
     */
    removeAllChannels: vi.fn(() => {
      channels.forEach(channel => {
        if (channel.unsubscribe) {
          channel.unsubscribe();
        }
      });
      channels.length = 0;
    }),

    /**
     * Cleanup function for test isolation
     * Call this in afterEach to prevent test interference
     */
    __cleanup: () => {
      // Unsubscribe all realtime subscriptions
      subscriptions.forEach(unsubscribe => {
        try {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch (error) {
          // Silently ignore cleanup errors
        }
      });
      subscriptions.length = 0;

      // Clear auth callbacks
      authCallbacks.length = 0;

      // Clear channels
      channels.forEach(channel => {
        try {
          if (channel.unsubscribe) {
            channel.unsubscribe();
          }
        } catch (error) {
          // Silently ignore cleanup errors
        }
      });
      channels.length = 0;

      // Clear all mock call history
      vi.clearAllMocks();
    }
  };

  return mockSupabase;
};

/**
 * Default mock responses for common queries
 * Use these in tests for consistent mock data
 */
export const mockResponses = {
  emptyData: { data: [], error: null },
  nullData: { data: null, error: null },
  singleUser: {
    data: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client',
      created_at: new Date().toISOString()
    },
    error: null
  },
  error: {
    data: null,
    error: {
      message: 'Test error',
      code: 'TEST_ERROR'
    }
  }
};
