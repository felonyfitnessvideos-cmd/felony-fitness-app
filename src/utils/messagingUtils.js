/**
 * @fileoverview Messaging Utilities
 * @description Comprehensive utilities for handling direct messaging functionality
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * 
 * This module provides utilities for:
 * - Fetching conversations and messages
 * - Sending messages via Edge Function
 * - Managing message read status
 * - Real-time message updates
 * - Error handling and retry logic
 * 
 * @requires @supabase/supabase-js
 */

import { supabase } from '../supabaseClient';

// =====================================================================================
// TYPES AND INTERFACES
// =====================================================================================

/**
 * @typedef {Object} Conversation
 * @property {string} user_id - The ID of the other user in the conversation
 * @property {string} user_full_name - Full name of the other user
 * @property {string} user_email - Email of the other user
 * @property {string} last_message_content - Content of the most recent message
 * @property {string} last_message_at - Timestamp of the most recent message
 * @property {number} unread_count - Number of unread messages in this conversation
 * @property {boolean} is_last_message_from_me - Whether the last message was sent by current user
 */

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} sender_id - ID of the message sender
 * @property {string} recipient_id - ID of the message recipient
 * @property {string} content - Message content
 * @property {string} created_at - Message creation timestamp
 * @property {boolean} is_read - Whether the message has been read
 * @property {string} sender_name - Name of the message sender
 * @property {boolean} is_from_me - Whether the message was sent by current user
 */

/**
 * @typedef {Object} SendMessageRequest
 * @property {string} recipient_id - ID of the message recipient
 * @property {string} content - Message content to send
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} message - Success or error message
 * @property {any} [data] - Optional response data
 * @property {string} [error] - Optional error details
 */

// =====================================================================================
// CONVERSATION MANAGEMENT
// =====================================================================================

/**
 * Fetch all conversations for the current user
 * 
 * Retrieves a list of all conversations where the current user has exchanged messages,
 * including conversation metadata, last message info, and unread counts.
 * 
 * @async
 * @returns {Promise<Conversation[]>} Array of conversation objects
 * @throws {Error} When database query fails or user is not authenticated
 * 
 * @example
 * const conversations = await getConversations();
 * console.log('User has', conversations.length, 'conversations');
 */
export async function getConversations() {
  try {
    console.log('📥 Fetching conversations...');

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('get-conversations', {
      body: {}
    });

    if (error) {
      // If Edge Function fails, use fallback
      console.log('⚠️ Edge Function failed. Using fallback approach...');
      return await getConversationsFallback();
    }

    console.log('✅ Fetched', data?.conversations?.length || 0, 'conversations');
    return data?.conversations || [];
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
  }
}

/**
 * Fallback method to get conversations when database functions are not available
 * This creates conversation list using trainer-client relationships
 */
async function getConversationsFallback() {
  try {
    console.log('📥 Using fallback conversation method...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('⚠️ No authenticated user for conversations fallback');
      return [];
    }

    const fallbackConversations = [];

    // Get trainer-client relationships to show potential conversations
    const { data: relationships, error: relationshipsError } = await supabase
      .from('trainer_clients')
      .select('client_id, trainer_id')
      .or(`trainer_id.eq.${user.id},client_id.eq.${user.id}`)
      .eq('status', 'active');

    if (!relationshipsError && relationships) {
      // Get unique user IDs (excluding self)
      const otherUserIds = relationships.map(rel =>
        rel.trainer_id === user.id ? rel.client_id : rel.trainer_id
      ).filter(id => id !== user.id);

      // Fetch user profiles separately
      if (otherUserIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .in('id', otherUserIds);

        if (!usersError && users) {
          users.forEach(otherUser => {
            fallbackConversations.push({
              user_id: otherUser.id,
              user_full_name: `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || otherUser.email,
              user_email: otherUser.email,
              last_message_content: 'Start a conversation...',
              last_message_at: new Date().toISOString(),
              unread_count: 0,
              is_last_message_from_me: false
            });
          });
        }
      }
    }

    console.log('✅ Fallback: showing', fallbackConversations.length, 'potential conversations from trainer-client relationships');
    return fallbackConversations;
  } catch (error) {
    console.error('Error in fallback conversations:', error);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation
 * 
 * Retrieves all messages between the current user and another user,
 * ordered chronologically from oldest to newest.
 * 
 * @async
 * @param {string} otherUserId - ID of the other user in the conversation
 * @returns {Promise<Message[]>} Array of message objects
 * @throws {Error} When database query fails or user is not authenticated
 * 
 * @example
 * const messages = await getConversationMessages('user-123');
 * messages.forEach(msg => console.log(msg.is_from_me ? 'You:' : 'Them:', msg.content));
 */
export async function getConversationMessages(otherUserId) {
  try {
    console.log('📥 Fetching messages for conversation with:', otherUserId);

    if (!otherUserId) {
      throw new Error('Other user ID is required');
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('get-conversation-messages', {
      body: { other_user_id: otherUserId }
    });

    if (error) {
      // If Edge Function fails, use fallback
      console.log('⚠️ Edge Function failed. Using fallback approach...');
      return await getConversationMessagesFallback(otherUserId);
    }

    console.log('✅ Fetched', data?.messages?.length || 0, 'messages');
    return data?.messages || [];
  } catch (_error) {
    console.error('Error in getConversationMessages:', _error);
    throw _error;
  }
}

/**
 * Fallback method to get conversation messages when database functions are not available
 */
async function getConversationMessagesFallback(otherUserId) {
  try {
    console.log('📥 Using fallback messages method for user:', otherUserId);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('⚠️ No authenticated user for messages fallback');
      return [];
    }

    // Query the direct_messages table directly WITHOUT foreign key relationships
    const { data: messages, error: messagesError } = await supabase
      .from('direct_messages')
      .select('id, sender_id, recipient_id, content, created_at, read_at')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error in fallback messages query:', messagesError);
      return [];
    }

    // Get sender info separately if we have messages
    let senderNames = {};
    if (messages && messages.length > 0) {
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: senders } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', senderIds);

      if (senders) {
        senders.forEach(sender => {
          senderNames[sender.id] = `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || sender.email;
        });
      }
    }

    // Transform messages to match expected format
    const fallbackMessages = (messages || []).map(message => ({
      id: message.id,
      sender_id: message.sender_id,
      recipient_id: message.recipient_id,
      content: message.content,
      created_at: message.created_at,
      read_at: message.read_at,
      sender_name: senderNames[message.sender_id] || 'Unknown User',
      is_from_current_user: message.sender_id === user.id,
      is_read: message.read_at !== null
    }));

    console.log('✅ Fallback: showing', fallbackMessages.length, 'messages from direct query');
    return fallbackMessages;
  } catch (error) {
    console.error('Error in fallback messages:', error);
    return [];
  }
}

// =====================================================================================
// MESSAGE SENDING
// =====================================================================================

/**
 * Send a new message via Supabase Edge Function
 * 
 * Sends a message to another user using the secure Edge Function that handles
 * database storage and email notifications.
 * 
 * @async
 * @param {string} recipientId - ID of the message recipient
 * @param {string} content - Message content to send
 * @returns {Promise<Object>} Response data from the Edge Function
 * @throws {Error} When message sending fails
 * 
 * @example
 * const result = await sendMessage('user-123', 'Hello! How is your training going?');
 * console.log('Message sent with ID:', result.message_id);
 */
export async function sendMessage(recipientId, content) {
  try {
    console.log('📤 Sending message to:', recipientId);

    if (!recipientId || !content) {
      throw new Error('Recipient ID and content are required');
    }

    if (content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 5000) {
      throw new Error('Message too long (maximum 5000 characters)');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required to send messages');
    }

    // Insert message directly into database
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
        message_type: 'text',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }

    console.log('✅ Message sent successfully:', data.id);
    return { message_id: data.id, success: true };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

/**
 * Fallback method to send messages when Edge Function is not available
 * Uses the send_direct_message database function
 */
async function _sendMessageFallback(recipientId, content) {
  try {
    console.log('📤 Using fallback send message method (database function)...');

    // Use the database function to send message
    const { data: result, error: functionError } = await supabase
      .rpc('send_direct_message', {
        recipient_id: recipientId,
        message_content: content.trim()
      });

    if (functionError) {
      console.error('Database function error in fallback:', functionError);
      throw new Error(`Failed to send message: ${functionError.message}`);
    }

    if (!result || !result.success) {
      throw new Error('Message sending failed via database function');
    }

    console.log('✅ Fallback: message sent successfully via database function');
    return {
      message_id: result.message_id,
      success: true,
      created_at: result.created_at,
      message: result.message || 'Message sent successfully (via fallback method)'
    };
  } catch (error) {
    console.error('Error in fallback send message:', error);
    throw error;
  }
}

// =====================================================================================
// MESSAGE STATUS MANAGEMENT
// =====================================================================================

/**
 * Mark messages as read in a conversation
 * 
 * Marks all unread messages from a specific user as read, updating the database
 * and returning the number of messages that were updated.
 * 
 * @async
 * @param {string} otherUserId - ID of the other user in the conversation
 * @returns {Promise<number>} Number of messages marked as read
 * @throws {Error} When database update fails
 * 
 * @example
 * const markedCount = await markMessagesAsRead('user-123');
 * console.log('Marked', markedCount, 'messages as read');
 */
export async function markMessagesAsRead(otherUserId) {
  try {
    console.log('📖 Marking messages as read for conversation with:', otherUserId);

    if (!otherUserId) {
      throw new Error('Other user ID is required');
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('mark-messages-as-read', {
      body: { other_user_id: otherUserId }
    });

    if (error) {
      // If Edge Function fails, use fallback
      console.log('⚠️ Edge Function failed. Using fallback approach...');
      return await markMessagesAsReadFallback(otherUserId);
    }

    const markedCount = data?.marked_count || 0;
    console.log('✅ Marked', markedCount, 'messages as read');
    return markedCount;
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    throw error;
  }
}

/**
 * Fallback method to mark messages as read when database functions are not available
 */
async function markMessagesAsReadFallback(otherUserId) {
  try {
    console.log('📖 Using fallback mark as read method...');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('⚠️ No authenticated user for mark as read fallback');
      return 0;
    }

    // Update messages directly
    const { error: updateError, count } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', user.id)
      .is('read_at', null);

    if (updateError) {
      console.error('Error in fallback mark as read:', updateError);
      return 0;
    }

    const markedCount = count || 0;
    console.log('✅ Fallback: marked', markedCount, 'messages as read via direct update');
    return markedCount;
  } catch (error) {
    console.error('Error in fallback mark as read:', error);
    return 0;
  }
}

/**
 * Get total unread message count for current user
 * 
 * Returns the total number of unread messages across all conversations
 * for the current user. Useful for displaying notification badges.
 * 
 * @async
 * @returns {Promise<number>} Total number of unread messages
 * @throws {Error} When database query fails
 * 
 * @example
 * const unreadCount = await getUnreadMessageCount();
 * if (unreadCount > 0) {
 *   console.log('You have', unreadCount, 'unread messages');
 * }
 */
export async function getUnreadMessageCount() {
  try {
    console.log('📊 Fetching unread message count...');

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('get-unread-message-count', {
      body: {}
    });

    if (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(`Failed to fetch unread count: ${error.message}`);
    }

    const count = data?.count || 0;
    console.log('✅ Unread message count:', count);
    return count;
  } catch (error) {
    console.error('Error in getUnreadMessageCount:', error);
    throw error;
  }
}

// =====================================================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================================================

/**
 * Subscribe to new messages for real-time updates
 * 
 * Sets up a real-time subscription to listen for new messages sent to the current user.
 * The callback function will be called whenever a new message is received.
 * 
 * @param {Function} callback - Function to call when new messages arrive
 * @returns {Object} Subscription object that can be used to unsubscribe
 * @throws {Error} When subscription setup fails
 * 
 * @example
 * const subscription = subscribeToMessages((payload) => {
 *   console.log('New message received:', payload.new);
 *   // Update UI to show new message
 * });
 * 
 * // Later, unsubscribe
 * subscription.unsubscribe();
 */
export async function subscribeToMessages(callback) {
  try {
    console.log('🔔 Setting up real-time message subscription...');

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    // Get current user synchronously
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('⚠️ No authenticated user for message subscription');
      return null;
    }

    const subscription = supabase
      .channel('direct_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 New message received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Message subscription status:', status);
      });

    console.log('✅ Real-time subscription established');
    return subscription;
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    throw error;
  }
}

/**
 * Subscribe to message read status updates
 * 
 * Sets up a real-time subscription to listen for when messages are marked as read.
 * Useful for updating UI indicators when the recipient reads your messages.
 * 
 * @param {Function} callback - Function to call when message read status changes
 * @returns {Object} Subscription object that can be used to unsubscribe
 * @throws {Error} When subscription setup fails
 * 
 * @example
 * const subscription = subscribeToMessageUpdates((payload) => {
 *   if (payload.new.is_read && !payload.old.is_read) {
 *     console.log('Message was read:', payload.new.id);
 *   }
 * });
 */
export function subscribeToMessageUpdates(callback) {
  try {
    console.log('🔔 Setting up message update subscription...');

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const subscription = supabase
      .channel('message_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          console.log('📝 Message updated:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Update subscription status:', status);
      });

    console.log('✅ Message update subscription established');
    return subscription;
  } catch (error) {
    console.error('Error setting up message update subscription:', error);
    throw error;
  }
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

/**
 * Format message timestamp for display
 * 
 * Converts a message timestamp into a human-readable format,
 * showing relative time for recent messages and absolute time for older ones.
 * 
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted timestamp for display
 * 
 * @example
 * formatMessageTime('2025-11-02T10:30:00Z') // "10:30 AM"
 * formatMessageTime('2025-11-01T15:00:00Z') // "Yesterday"
 * formatMessageTime('2025-10-30T12:00:00Z') // "Oct 30"
 */
export function formatMessageTime(timestamp) {
  try {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Less than 1 minute ago
    if (diffInMinutes < 1) {
      return 'Just now';
    }

    // Less than 1 hour ago
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    // Less than 24 hours ago (same day)
    if (diffInHours < 24 && messageDate.getDate() === now.getDate()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    if (diffInDays === 1) {
      return 'Yesterday';
    }

    // Within the past week
    if (diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }

    // Within the current year
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    // Older than current year
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (error) {
    console.error('Error formatting message time:', error);
    return 'Unknown time';
  }
}

/**
 * Truncate message content for preview
 * 
 * Truncates long message content to a specified length for display in conversation lists.
 * Preserves word boundaries when possible.
 * 
 * @param {string} content - Original message content
 * @param {number} maxLength - Maximum length for truncated content (default: 100)
 * @returns {string} Truncated content with ellipsis if needed
 * 
 * @example
 * truncateMessage('This is a very long message that should be truncated', 20)
 * // Returns: "This is a very long..."
 */
export function truncateMessage(content, maxLength = 100) {
  try {
    if (!content || typeof content !== 'string') {
      return '';
    }

    if (content.length <= maxLength) {
      return content;
    }

    // Try to truncate at word boundary
    const truncated = content.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > maxLength * 0.7) { // Only use word boundary if it's not too short
      return truncated.substring(0, lastSpaceIndex) + '...';
    }

    return truncated + '...';
  } catch (error) {
    console.error('Error truncating message:', error);
    return content || '';
  }
}

/**
 * Validate message content before sending
 * 
 * Performs client-side validation of message content to ensure it meets
 * requirements before attempting to send via the Edge Function.
 * 
 * @param {string} content - Message content to validate
 * @returns {Object} Validation result with isValid boolean and error message
 * 
 * @example
 * const validation = validateMessageContent('Hello there!');
 * if (validation.isValid) {
 *   await sendMessage(recipientId, content);
 * } else {
 *   console.error('Invalid message:', validation.error);
 * }
 */
export function validateMessageContent(content) {
  try {
    if (!content || typeof content !== 'string') {
      return { isValid: false, error: 'Message content is required' };
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmedContent.length > 5000) {
      return { isValid: false, error: 'Message too long (maximum 5000 characters)' };
    }

    // Check for potentially problematic content
    if (trimmedContent.length < 1) {
      return { isValid: false, error: 'Message too short' };
    }

    return { isValid: true, error: null };
  } catch (error) {
    console.error('Error validating message content:', error);
    return { isValid: false, error: 'Validation error occurred' };
  }
}

// =====================================================================================
// ERROR HANDLING UTILITIES
// =====================================================================================

/**
 * Handle messaging errors with user-friendly messages
 * 
 * Converts technical error messages into user-friendly explanations
 * that can be displayed in the UI.
 * 
 * @param {Error} error - The error object to handle
 * @returns {string} User-friendly error message
 * 
 * @example
 * try {
 *   await sendMessage(recipientId, content);
 * } catch (error) {
 *   const userMessage = handleMessagingError(error);
 *   showErrorToUser(userMessage);
 * }
 */
export function handleMessagingError(error) {
  console.error('Messaging error:', error);

  if (!error) {
    return 'An unknown error occurred';
  }

  const errorMessage = error.message || error.toString();

  // Authentication errors
  if (errorMessage.includes('Authentication') || errorMessage.includes('auth')) {
    return 'Please log in to send messages';
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again';
  }

  // Validation errors
  if (errorMessage.includes('empty') || errorMessage.includes('required')) {
    return 'Please enter a message before sending';
  }

  if (errorMessage.includes('too long')) {
    return 'Message is too long. Please shorten it and try again';
  }

  // Server errors
  if (errorMessage.includes('server') || errorMessage.includes('500')) {
    return 'Server error. Please try again in a moment';
  }

  // Default fallback
  return 'Unable to send message. Please try again';
}

/**
 * Retry messaging operation with exponential backoff
 * 
 * Retries a messaging operation (like sending a message) with increasing delays
 * between attempts. Useful for handling temporary network or server issues.
 * 
 * @async
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise} Result of the successful operation
 * @throws {Error} If all retry attempts fail
 * 
 * @example
 * const result = await retryMessagingOperation(
 *   () => sendMessage(recipientId, content),
 *   3,
 *   1000
 * );
 */
export async function retryMessagingOperation(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Messaging operation attempt ${attempt + 1}/${maxRetries + 1}`);
      const result = await operation();
      console.log('✅ Messaging operation succeeded');
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ Messaging operation attempt ${attempt + 1} failed:`, error);

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry certain types of errors
      if (error.message?.includes('Authentication') ||
        error.message?.includes('validation') ||
        error.message?.includes('empty') ||
        error.message?.includes('too long')) {
        console.log('🚫 Not retrying due to error type');
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

console.log('📡 Messaging utilities loaded successfully');