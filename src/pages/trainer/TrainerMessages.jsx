/**
 * @file TrainerMessages.jsx
 * @description Client communication hub with real-time messaging and email notifications
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @project Felony Fitness
 * 
 * This component provides a comprehensive messaging interface for trainers to communicate
 * with clients through direct messages. Features include:
 * 
 * - Real-time conversation management with Supabase
 * - Email notifications via Resend API
 * - Conversation history and search
 * - Message read status tracking
 * - Responsive design for mobile and desktop
 * 
 * @requires react
 * @requires lucide-react
 * @requires messagingUtils
 */

import { AlertCircle, Loader, MessageSquare, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../AuthContext';
import {
  getConversationMessages,
  getConversations,
  handleMessagingError,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
  validateMessageContent
} from '../../utils/messagingUtils';
import './TrainerMessages.css';

/**
 * TrainerMessages Component
 * 
 * Provides a comprehensive messaging interface for trainer-client communication.
 * Supports both SMS and email channels with conversation history and real-time updates.
 * 
 * @component
 * @returns {JSX.Element} The complete messaging interface
 * 
 * @example
 * <TrainerMessages />
 * 
 * State Management:
 * @state {Array} conversations - List of client conversations with message history
 * @state {Object|null} selectedConversation - Currently active conversation
 * @state {string} newMessage - Message being composed
 * @state {string} messageType - Communication channel ('sms' or 'email')
 */
const TrainerMessages = () => {
  const { user } = useAuth();

  /** @type {[Array, Function]} Array of conversation objects with client messaging history */
  const [conversations, setConversations] = useState([]);

  /** @type {[Object|null, Function]} Currently selected conversation for viewing/messaging */
  const [selectedConversation, setSelectedConversation] = useState(null);

  /** @type {[Array, Function]} Messages in the current conversation */
  const [messages, setMessages] = useState([]);

  /** @type {[string, Function]} Message content being composed */
  const [newMessage, setNewMessage] = useState('');

  /** @type {[boolean, Function]} Loading state for conversations */
  const [loading, setLoading] = useState(true);

  /** @type {[boolean, Function]} Sending state for new messages */
  const [sendingMessage, setSendingMessage] = useState(false);

  /** @type {[string|null, Function]} Error state for messaging operations */
  const [error, setError] = useState(null);

  /** @type {[string, Function]} Search term for filtering conversations */
  const [_searchTerm, _setSearchTerm] = useState('');

  /** @type {[Array, Function]} List of all clients for sidebar */
  const [allClients, setAllClients] = useState([]);

  // Refs for auto-scrolling and message input
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  /**
   * Load conversations on component mount and set up real-time subscription
   */
  useEffect(() => {
    loadConversations();
    loadAllClients(); // Load clients for sidebar

    let subscription;
    const setupSubscription = async () => {
      try {
        subscription = await subscribeToMessages((payload) => {
          console.log('📨 New message received:', payload);
          loadConversations();

          if (selectedConversation &&
            (payload.new.sender_id === selectedConversation.user_id ||
              payload.new.recipient_id === selectedConversation.user_id)) {
            loadMessages(selectedConversation.user_id);
          }
        });
      } catch (error) {
        console.error('Failed to setup message subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      subscription?.unsubscribe();
    };
  }, [selectedConversation, loadConversations, loadMessages]);

  /**
   * Load messages when conversation selection changes
   */
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
      markConversationAsRead(selectedConversation.user_id);
    }
  }, [selectedConversation, loadMessages, markConversationAsRead]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Load conversations from database
   */
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const conversations = await getConversations();
      setConversations(conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setError(handleMessagingError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all clients for new message modal
   */
  const loadAllClients = async () => {
    try {
      const { supabase } = await import('../../supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Get all clients from trainer_clients relationship
      const { data: relationships, error } = await supabase
        .from('trainer_clients')
        .select('client_id')
        .eq('trainer_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const clientIds = relationships?.map(rel => rel.client_id) || [];

      if (clientIds.length > 0) {
        const { data: clients, error: clientsError } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .in('id', clientIds);

        if (clientsError) throw clientsError;

        setAllClients(clients || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  /**
   * Start conversation with a client
   */
  const startConversation = (client) => {
    setSelectedConversation({
      user_id: client.id,
      user_full_name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
      user_email: client.email,
      last_message_content: '',
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      is_last_message_from_me: false
    });
    loadMessages(client.id);
  };

  /**
   * Load messages for a specific conversation
   */
  const loadMessages = useCallback(async (otherUserId) => {
    try {
      setError(null);

      const messages = await getConversationMessages(otherUserId);
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError(handleMessagingError(error));
    }
  }, []);

  /**
   * Mark conversation messages as read
   */
  const markConversationAsRead = useCallback(async (otherUserId) => {
    try {
      await markMessagesAsRead(otherUserId);
      // Refresh conversations to update unread counts
      loadConversations();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [loadConversations]);

  /**
   * Handle sending a new message
   */
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) {
      return;
    }

    const validation = validateMessageContent(newMessage);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setSendingMessage(true);
      setError(null);

      await sendMessage(selectedConversation.user_id, newMessage.trim());

      // Clear the input
      setNewMessage('');

      // Refresh messages and conversations
      await Promise.all([
        loadMessages(selectedConversation.user_id),
        loadConversations()
      ]);

      // Focus back to input
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(handleMessagingError(error));
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Handle conversation selection
   */
  const _handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setError(null);
  };

  /**
   * Handle Enter key press in message input
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Auto-scroll to bottom of messages
   */
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Get initials from a full name
   */
  /**
   * Get initials from a full name
   * Handles edge cases: empty strings, whitespace-only, emails
   */
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    // Filter out empty strings from split (handles multiple spaces)
    const names = fullName.trim().split(' ').filter(n => n.length > 0);
    
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
    
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  /**
   * Filter conversations based on search term
   */
  const _filteredConversations = conversations.filter(conversation =>
    conversation.user_full_name?.toLowerCase().includes(_searchTerm.toLowerCase()) ||
    conversation.user_email?.toLowerCase().includes(_searchTerm.toLowerCase()) ||
    conversation.last_message_content?.toLowerCase().includes(_searchTerm.toLowerCase())
  );







  return (
    <div className="trainer-messages-container">
      {!selectedConversation ? (
        /* Client Cards Grid */
        <div className="clients-grid">
          {loading ? (
            <div className="loading-state">
              <Loader className="spinning" size={20} />
              <p>Loading clients...</p>
            </div>
          ) : allClients.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} style={{ opacity: 0.3 }} />
              <p>No clients yet</p>
              <p>Add clients through the Client Onboarding tool to start messaging.</p>
            </div>
          ) : (
            allClients.map(client => (
              <div
                key={client.id}
                className="client-message-card"
                onClick={() => startConversation(client)}
              >
                <div className="client-avatar">
                  {(client.first_name?.[0] || client.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="client-card-info">
                  <h3>{`${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email}</h3>
                  <p>{client.email}</p>
                </div>
                <MessageSquare size={20} />
              </div>
            ))
          )}
        </div>
      ) : (
        /* Messaging View */
        <div className="messaging-view">
          <div className="messages-header-bar">
            <button
              className="back-button"
              onClick={() => setSelectedConversation(null)}
              aria-label="Back to conversations"
            >
              ←
            </button>
            <h3>{selectedConversation.user_full_name || 'Unknown User'}</h3>
          </div>

          <div className="messages-content">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <MessageSquare size={48} />
                <p>No messages yet</p>
                <p>Send a message to get started!</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.is_from_current_user ? 'sent' : 'received'}`}
                >
                  {!message.is_from_current_user && (
                    <div className="message-avatar">
                      {getInitials(selectedConversation.user_full_name)}
                    </div>
                  )}
                  <div className="message-bubble">
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                  {message.is_from_current_user && (
                    <div className="message-avatar message-avatar-sent">
                      {getInitials(user?.user_metadata?.full_name || user?.email)}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-composer">
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="composer-input">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                disabled={sendingMessage}
                aria-label="Message text"
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={!newMessage.trim() || sendingMessage}
                aria-label="Send message"
              >
                {sendingMessage ? <Loader className="spinning" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global error display */}
      {error && (
        <div className="global-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default TrainerMessages;
