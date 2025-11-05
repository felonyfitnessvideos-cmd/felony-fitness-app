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

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, AlertCircle, CheckCircle, Loader, Plus } from 'lucide-react';
import { 
  getConversations, 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead, 
  subscribeToMessages,
  formatMessageTime,
  truncateMessage,
  validateMessageContent,
  handleMessagingError
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
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @type {[Object|null, Function]} Real-time message subscription */
  const [messageSubscription, setMessageSubscription] = useState(null);
  
  // Refs for auto-scrolling and message input
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  /**
   * Load conversations on component mount and set up real-time subscription
   */
  useEffect(() => {
    loadConversations();
    
    const setupSubscription = async () => {
      try {
        const subscription = await subscribeToMessages((payload) => {
          console.log('📨 New message received:', payload);
          loadConversations();
          
          if (selectedConversation && 
              (payload.new.sender_id === selectedConversation.user_id || 
               payload.new.recipient_id === selectedConversation.user_id)) {
            loadMessages(selectedConversation.user_id);
          }
        });
        
        if (subscription) {
          setMessageSubscription(subscription);
        }
      } catch (error) {
        console.error('Failed to setup message subscription:', error);
      }
    };
    
    setupSubscription();
    
    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
    };
  }, [selectedConversation]);
  
  /**
   * Load messages when conversation selection changes
   */
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
      markConversationAsRead(selectedConversation.user_id);
    }
  }, [selectedConversation]);
  
  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  /**
   * Load conversations from database
   */
  const loadConversations = async () => {
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
  };
  
  /**
   * Load messages for a specific conversation
   */
  const loadMessages = async (otherUserId) => {
    try {
      setError(null);
      
      const messages = await getConversationMessages(otherUserId);
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError(handleMessagingError(error));
    }
  };
  
  /**
   * Mark conversation messages as read
   */
  const markConversationAsRead = async (otherUserId) => {
    try {
      await markMessagesAsRead(otherUserId);
      // Refresh conversations to update unread counts
      loadConversations();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };
  
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
  const handleConversationSelect = (conversation) => {
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
   * Filter conversations based on search term
   */
  const filteredConversations = conversations.filter(conversation =>
    conversation.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  






  return (
    <div className="trainer-messages-container">
      <div className="messages-header">
        <h2><MessageSquare size={24} />Client Messages</h2>
        <button onClick={() => console.log('New message feature coming soon')} className="new-message-button">
          <Plus size={18} />
          New Message
        </button>
      </div>

      <div className="messages-layout">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="conversations-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">
                <Loader className="spinning" size={20} />
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={32} />
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <div
                  key={conversation.user_id}
                  className={`conversation-item ${selectedConversation?.user_id === conversation.user_id ? 'selected' : ''}`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <span className="client-name">{conversation.user_full_name || 'Unknown User'}</span>
                      {conversation.unread_count > 0 && (
                        <span className="unread-badge">{conversation.unread_count}</span>
                      )}
                    </div>
                    
                    <div className="last-message">
                      <span className="message-preview">
                        {truncateMessage(conversation.last_message_content || 'No messages yet', 50)}
                      </span>
                    </div>
                    
                    <div className="conversation-meta">
                      <span className="message-time">
                        {formatMessageTime(conversation.last_message_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages View */}
        <div className="messages-main">
          {selectedConversation ? (
            <>
              <div className="messages-header-bar">
                <h3>{selectedConversation.user_full_name || 'Unknown User'}</h3>
                <div className="message-actions">
                  <span className="user-email">{selectedConversation.user_email}</span>
                </div>
              </div>

              <div className="messages-content">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <MessageSquare size={48} />
                    <p>No messages in this conversation yet</p>
                    <p>Send a message to get started!</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.is_from_current_user ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-meta">
                        <span className="message-time">{formatMessageTime(message.created_at)}</span>
                        {message.is_from_current_user && (
                          <span className="message-status">
                            {message.is_read ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          </span>
                        )}
                      </div>
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
                    placeholder="Type your message..."
                    rows={3}
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-button"
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? <Loader className="spinning" size={18} /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageSquare size={48} />
              <h3>Select a conversation</h3>
              <p>Choose a client from the left to start messaging, or create a new conversation.</p>
            </div>
          )}
        </div>
      </div>

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
