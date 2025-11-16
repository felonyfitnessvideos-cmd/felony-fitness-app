/**
 * @file TrainerMessages.jsx
 * @description Client communication hub with expandable messaging cards
 * @author Felony Fitness Development Team
 * @version 3.0.0
 * @project Felony Fitness
 * 
 * This component provides a comprehensive messaging interface for trainers to communicate
 * with clients through direct messages. Features include:
 * 
 * - Expandable client cards with inline messaging
 * - Real-time conversation management with Supabase
 * - Message read status tracking
 * - Responsive design for mobile and desktop
 * 
 * @requires react
 * @requires lucide-react
 * @requires messagingUtils
 */

import { AlertCircle, ChevronDown, ChevronUp, Loader, MessageSquare, Send } from 'lucide-react';
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
 * Provides expandable client cards with inline messaging.
 * Each client card can be expanded to show their conversation history and send messages.
 * 
 * @component
 * @returns {JSX.Element} The complete messaging interface with expandable cards
 */
const TrainerMessages = () => {
  const { user } = useAuth();

  const [allClients, setAllClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [clientMessages, setClientMessages] = useState({});
  const [newMessages, setNewMessages] = useState({});
  const [sendingStates, setSendingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);

  const messagesEndRefs = useRef({});

  /**
   * Auto-scroll to bottom of messages for a specific client
   */
  const scrollToBottom = (clientId) => {
    if (messagesEndRefs.current[clientId]) {
      messagesEndRefs.current[clientId].scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Load conversations from database
   */
  const loadConversations = useCallback(async () => {
    try {
      const conversations = await getConversations();
      setConversations(conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  /**
   * Load messages for a specific client
   */
  const loadMessagesForClient = useCallback(async (clientId) => {
    try {
      setError(null);
      const messages = await getConversationMessages(clientId);
      setClientMessages(prev => ({
        ...prev,
        [clientId]: messages
      }));
      
      // Longer delay to allow expansion animation to complete
      setTimeout(() => {
        scrollToBottom(clientId);
      }, 350);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError(handleMessagingError(error));
    }
  }, []);

  /**
   * Mark conversation messages as read
   */
  const markConversationAsRead = useCallback(async (clientId) => {
    try {
      await markMessagesAsRead(clientId);
      loadConversations();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [loadConversations]);

  /**
   * Load all clients
   */
  const loadAllClients = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../../supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

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
    } finally {
      setLoading(false);
    }
  };

  /**
   * Setup on mount
   */
  useEffect(() => {
    loadConversations();
    loadAllClients();

    let subscription;
    const setupSubscription = async () => {
      try {
        subscription = await subscribeToMessages((payload) => {
          loadConversations();

          if (expandedClientId &&
            (payload.new.sender_id === expandedClientId ||
              payload.new.recipient_id === expandedClientId)) {
            loadMessagesForClient(expandedClientId);
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
  }, [expandedClientId, loadConversations, loadMessagesForClient]);

  /**
   * Toggle client card expansion
   */
  const toggleClientCard = (clientId) => {
    const container = document.querySelector('.clients-grid');
    
    if (expandedClientId === clientId) {
      // Collapsing
      setExpandedClientId(null);
    } else {
      // Expanding - prevent scroll jump by temporarily locking scroll position
      if (container) {
        const scrollPos = container.scrollTop;
        
        // Temporarily prevent scroll during expansion
        container.style.overflow = 'hidden';
        
        setExpandedClientId(clientId);
        loadMessagesForClient(clientId);
        markConversationAsRead(clientId);
        
        // Restore scroll and position after expansion animation
        setTimeout(() => {
          container.scrollTop = scrollPos;
          container.style.overflow = 'auto';
        }, 50);
      } else {
        setExpandedClientId(clientId);
        loadMessagesForClient(clientId);
        markConversationAsRead(clientId);
      }
    }
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (clientId) => {
    const messageContent = newMessages[clientId];
    
    if (!messageContent?.trim()) {
      return;
    }

    const validation = validateMessageContent(messageContent);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setSendingStates(prev => ({ ...prev, [clientId]: true }));
      setError(null);

      await sendMessage(clientId, messageContent.trim());

      setNewMessages(prev => ({ ...prev, [clientId]: '' }));

      await Promise.all([
        loadMessagesForClient(clientId),
        loadConversations()
      ]);

      setTimeout(() => {
        scrollToBottom(clientId);
      }, 150);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(handleMessagingError(error));
    } finally {
      setSendingStates(prev => ({ ...prev, [clientId]: false }));
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (event, clientId) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(clientId);
    }
  };

  /**
   * Get initials from name
   */
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    let nameToProcess = fullName.trim();

    if (nameToProcess.includes('@')) {
      const localPart = nameToProcess.split('@')[0];
      nameToProcess = localPart.replace(/[._-]/g, ' ');
    }

    const names = nameToProcess.split(' ').filter(n => n.length > 0);

    if (names.length === 0) return '?';
    if (names.length === 1) return names[0][0]?.toUpperCase() || '?';

    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  /**
   * Get unread count for a client
   */
  const getUnreadCount = (clientId) => {
    const conversation = conversations.find(c => c.user_id === clientId);
    return conversation?.unread_count || 0;
  };

  return (
    <div className="trainer-messages-container">
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
          allClients.map(client => {
            const clientId = client.id;
            const isExpanded = expandedClientId === clientId;
            const messages = clientMessages[clientId] || [];
            const unreadCount = getUnreadCount(clientId);
            const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email;

            return (
              <div 
                key={clientId} 
                className={`client-message-card-expandable ${isExpanded ? 'expanded' : ''}`}
                data-client-id={clientId}
              >
                {/* Compact Client Card Header */}
                <div 
                  className="client-card-header-compact"
                  onClick={() => toggleClientCard(clientId)}
                >
                  <div className="client-avatar-small">
                    {(client.first_name?.[0] || client.email?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="client-info-compact">
                    <div className="client-name-row">
                      <span className="client-name">{clientName}</span>
                      {unreadCount > 0 && (
                        <span className="unread-badge-small">{unreadCount}</span>
                      )}
                    </div>
                    <span className="client-email-small">{client.email}</span>
                  </div>
                  <div className="expand-icon">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Messaging Section */}
                {isExpanded && (
                  <div className="client-card-messaging">
                    <div className="messages-content-inline">
                      {messages.length === 0 ? (
                        <div className="empty-messages-inline">
                          <MessageSquare size={32} style={{ opacity: 0.3 }} />
                          <p>No messages yet</p>
                        </div>
                      ) : (
                        <>
                          {messages.map(message => (
                            <div
                              key={message.id}
                              className={`message ${message.is_from_current_user ? 'sent' : 'received'}`}
                            >
                              {!message.is_from_current_user && (
                                <div className="message-avatar">
                                  {getInitials(message.sender_name || clientName)}
                                </div>
                              )}
                              <div className="message-bubble">
                                <div className="message-content">
                                  {message.content}
                                </div>
                              </div>
                              {message.is_from_current_user && (
                                <div className="message-avatar message-avatar-sent">
                                  {getInitials(message.sender_name || user?.user_metadata?.full_name || user?.email)}
                                </div>
                              )}
                            </div>
                          ))}
                          <div ref={el => messagesEndRefs.current[clientId] = el} />
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="message-composer-inline">
                      {error && (
                        <div className="error-message">
                          <AlertCircle size={16} />
                          {error}
                        </div>
                      )}
                      <div className="composer-input">
                        <textarea
                          value={newMessages[clientId] || ''}
                          onChange={(e) => setNewMessages(prev => ({ ...prev, [clientId]: e.target.value }))}
                          onKeyPress={(e) => handleKeyPress(e, clientId)}
                          placeholder="Message..."
                          disabled={sendingStates[clientId]}
                          rows={1}
                        />
                        <button
                          onClick={() => handleSendMessage(clientId)}
                          className="send-button"
                          disabled={!newMessages[clientId]?.trim() || sendingStates[clientId]}
                        >
                          {sendingStates[clientId] ? <Loader className="spinning" size={18} /> : <Send size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
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
