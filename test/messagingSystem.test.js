/**
 * @file messagingSystem.test.js
 * @description Comprehensive tests for the messaging system
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @created 2025-11-03
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { supabase } from '../src/supabaseClient.js';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  formatMessageTime,
  truncateMessage,
  validateMessageContent,
  handleMessagingError
} from '../src/utils/messagingUtils.js';

describe('Messaging System Tests', () => {
  let testUser1, testUser2;
  let authSession1, authSession2;

  beforeAll(async () => {
    console.log('🔧 Setting up messaging system tests...');
    
    // Create test users for messaging tests
    try {
      // Note: In a real test environment, you would use test-specific auth
      // For now, we'll test with existing user data
      const { data: { user } } = await supabase.auth.getUser();
      testUser1 = user;
      
      if (!testUser1) {
        console.warn('⚠️ No authenticated user found. Some tests may be skipped.');
      }
    } catch (error) {
      console.error('❌ Failed to setup test users:', error);
    }
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up messaging system tests...');
    // Cleanup test data if needed
  });

  describe('Database Functions', () => {
    test('should call get_conversations function successfully', async () => {
      if (!testUser1) {
        console.log('⏭️ Skipping test - no authenticated user');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_conversations');
        
        if (error) {
          console.log('⚠️ Database function error (expected if no conversations exist):', error);
          // This is acceptable - function exists but may return empty results
        }
        
        expect(error).toBeFalsy();
        expect(Array.isArray(data)).toBe(true);
      } catch (error) {
        console.error('❌ Database function test failed:', error);
        throw error;
      }
    });

    test('should call get_conversation_messages function successfully', async () => {
      if (!testUser1) {
        console.log('⏭️ Skipping test - no authenticated user');
        return;
      }

      // Test with a dummy UUID (should return empty array)
      const dummyUserId = '00000000-0000-0000-0000-000000000000';
      
      try {
        const { data, error } = await supabase.rpc('get_conversation_messages', {
          other_user_id: dummyUserId
        });
        
        expect(error).toBeFalsy();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0); // Should be empty for dummy user
      } catch (error) {
        console.error('❌ Get conversation messages test failed:', error);
        throw error;
      }
    });

    test('should call send_direct_message function successfully', async () => {
      if (!testUser1) {
        console.log('⏭️ Skipping test - no authenticated user');
        return;
      }

      const dummyRecipientId = '00000000-0000-0000-0000-000000000000';
      const testMessage = 'Test message from automated test';
      
      try {
        // This should fail because the recipient doesn't exist, but function should be callable
        const { data, error } = await supabase.rpc('send_direct_message', {
          recipient_id: dummyRecipientId,
          message_content: testMessage
        });
        
        // We expect this to potentially fail due to invalid recipient
        // but the function should exist and be callable
        if (error) {
          console.log('⚠️ Expected error for dummy recipient:', error.message);
          expect(error.message).toContain('recipient'); // Should be a recipient-related error
        } else {
          // If it somehow succeeds, that's also fine
          expect(data).toBeTruthy();
          expect(data.success).toBe(true);
        }
      } catch (error) {
        console.error('❌ Send message function test failed:', error);
        throw error;
      }
    });
  });

  describe('Messaging Utils', () => {
    test('should get conversations (fallback mode)', async () => {
      try {
        const conversations = await getConversations();
        expect(Array.isArray(conversations)).toBe(true);
        console.log('✅ Retrieved', conversations.length, 'conversations');
        
        // Test structure if conversations exist
        if (conversations.length > 0) {
          const conversation = conversations[0];
          expect(conversation).toHaveProperty('user_id');
          expect(conversation).toHaveProperty('user_full_name');
          expect(conversation).toHaveProperty('user_email');
          expect(conversation).toHaveProperty('last_message_content');
          expect(conversation).toHaveProperty('unread_count');
        }
      } catch (error) {
        console.error('❌ Get conversations test failed:', error);
        throw error;
      }
    });

    test('should get conversation messages', async () => {
      if (!testUser1) {
        console.log('⏭️ Skipping test - no authenticated user');
        return;
      }

      const dummyUserId = '00000000-0000-0000-0000-000000000000';
      
      try {
        const messages = await getConversationMessages(dummyUserId);
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBe(0); // Should be empty for dummy user
        console.log('✅ Retrieved messages for dummy conversation');
      } catch (error) {
        console.error('❌ Get conversation messages test failed:', error);
        throw error;
      }
    });

    test('should handle message sending validation', async () => {
      // Test validation without actually sending
      try {
        const validation1 = validateMessageContent('');
        expect(validation1.isValid).toBe(false);
        expect(validation1.error).toContain('empty');

        const validation2 = validateMessageContent('Valid message');
        expect(validation2.isValid).toBe(true);
        expect(validation2.error).toBeNull();

        const validation3 = validateMessageContent('x'.repeat(5001));
        expect(validation3.isValid).toBe(false);
        expect(validation3.error).toContain('too long');

        console.log('✅ Message validation tests passed');
      } catch (error) {
        console.error('❌ Message validation test failed:', error);
        throw error;
      }
    });
  });

  describe('Utility Functions', () => {
    test('should format message timestamps correctly', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(formatMessageTime(now.toISOString())).toBe('Just now');
      expect(formatMessageTime(oneMinuteAgo.toISOString())).toBe('1m ago');
      expect(formatMessageTime(oneHourAgo.toISOString())).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
      expect(formatMessageTime(yesterday.toISOString())).toBe('Yesterday');

      console.log('✅ Message time formatting tests passed');
    });

    test('should truncate messages correctly', () => {
      const shortMessage = 'Short message';
      const longMessage = 'This is a very long message that should be truncated at some point to make it shorter for display purposes';

      expect(truncateMessage(shortMessage, 50)).toBe(shortMessage);
      expect(truncateMessage(longMessage, 20)).toContain('...');
      expect(truncateMessage(longMessage, 20).length).toBeLessThanOrEqual(23); // 20 + '...'

      console.log('✅ Message truncation tests passed');
    });

    test('should handle messaging errors correctly', () => {
      const authError = new Error('Authentication required');
      const networkError = new Error('network error occurred');
      const validationError = new Error('Message is empty');

      expect(handleMessagingError(authError)).toContain('log in');
      expect(handleMessagingError(networkError)).toContain('Network error');
      expect(handleMessagingError(validationError)).toContain('enter a message');

      console.log('✅ Error handling tests passed');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete messaging workflow (dry run)', async () => {
      try {
        // Test the complete workflow without actually sending messages
        console.log('🔄 Testing complete messaging workflow...');

        // 1. Get conversations
        const conversations = await getConversations();
        expect(Array.isArray(conversations)).toBe(true);
        console.log('✅ Step 1: Retrieved conversations');

        // 2. Validate message content
        const testMessage = 'Test workflow message';
        const validation = validateMessageContent(testMessage);
        expect(validation.isValid).toBe(true);
        console.log('✅ Step 2: Message validation passed');

        // 3. Test message formatting
        const formattedTime = formatMessageTime(new Date().toISOString());
        expect(formattedTime).toBe('Just now');
        console.log('✅ Step 3: Time formatting works');

        // 4. Test message truncation
        const truncated = truncateMessage(testMessage, 50);
        expect(truncated).toBe(testMessage); // Should not be truncated
        console.log('✅ Step 4: Message truncation works');

        console.log('✅ Complete messaging workflow test passed');
      } catch (error) {
        console.error('❌ Integration test failed:', error);
        throw error;
      }
    });
  });

  describe('Database Schema Verification', () => {
    test('should verify direct_messages table exists and has correct structure', async () => {
      try {
        // Try to query the table structure
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .limit(0); // Don't return any rows, just test the query

        if (error) {
          console.error('❌ Direct messages table query failed:', error);
          throw error;
        }

        console.log('✅ direct_messages table exists and is accessible');
        expect(error).toBeFalsy();
      } catch (error) {
        console.error('❌ Schema verification failed:', error);
        throw error;
      }
    });

    test('should verify user_profiles table has updated data', async () => {
      if (!testUser1) {
        console.log('⏭️ Skipping test - no authenticated user');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .eq('id', testUser1.id)
          .single();

        if (error) {
          console.error('❌ Profile query failed:', error);
          throw error;
        }

        expect(profile).toBeTruthy();
        expect(profile.first_name).toBe('David');
        expect(profile.last_name).toBe('Sharp');
        console.log('✅ Profile data has been updated correctly:', profile);
      } catch (error) {
        console.error('❌ Profile verification failed:', error);
        throw error;
      }
    });
  });
});

// Export test configuration
export default {
  testTimeout: 30000, // 30 second timeout for database operations
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testEnvironment: 'node'
};