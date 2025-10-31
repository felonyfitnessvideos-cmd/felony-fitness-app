/**
 * @file TrainerMessages.jsx
 * @description Client communication hub with SMS and email integration
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, Mail, Plus, Search } from 'lucide-react';

const TrainerMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('sms'); // 'sms' or 'email'

  useEffect(() => {
    // Mock conversation data
    setConversations([
      {
        id: 1,
        clientId: 1,
        clientName: "John Dough",
        lastMessage: "Thanks for the workout plan! When is our next session?",
        lastMessageTime: "2025-10-30 9:30 AM",
        unreadCount: 2,
        type: "sms",
        messages: [
          {
            id: 1,
            sender: "client",
            content: "Hi! I completed today's workout. It was challenging but great!",
            timestamp: "2025-10-29 6:00 PM",
            type: "sms"
          },
          {
            id: 2,
            sender: "trainer",
            content: "Excellent work! How did the squats feel? Any knee discomfort?",
            timestamp: "2025-10-29 6:15 PM",
            type: "sms"
          },
          {
            id: 3,
            sender: "client",
            content: "Squats felt good, no pain. Thanks for checking!",
            timestamp: "2025-10-29 6:20 PM",
            type: "sms"
          },
          {
            id: 4,
            sender: "client",
            content: "Thanks for the workout plan! When is our next session?",
            timestamp: "2025-10-30 9:30 AM",
            type: "sms"
          }
        ]
      },
      {
        id: 2,
        clientId: 2,
        clientName: "Jane Smith",
        lastMessage: "Could we reschedule tomorrow's session?",
        lastMessageTime: "2025-10-29 3:45 PM", 
        unreadCount: 1,
        type: "email",
        messages: [
          {
            id: 1,
            sender: "client",
            content: "Hi! I need to reschedule our session tomorrow. Something came up at work. Could we do Thursday instead?",
            timestamp: "2025-10-29 3:45 PM",
            type: "email"
          }
        ]
      }
    ]);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      sender: "trainer",
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      type: messageType
    };

    // Update the conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: message.timestamp
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message]
    });
    setNewMessage('');

    // TODO: Implement actual SMS/Email sending
    console.log(`Sending ${messageType} to ${selectedConversation.clientName}:`, newMessage);
  };

  const handleNewConversation = () => {
    // TODO: Show client selection modal
    console.log("Starting new conversation...");
  };

  return (
    <div className="trainer-messages-container">
      <div className="messages-header">
        <h2><MessageSquare size={24} />Client Messages</h2>
        <button onClick={handleNewConversation} className="new-message-button">
          <Plus size={18} />
          New Message
        </button>
      </div>

      <div className="messages-layout">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="conversations-search">
            <Search size={16} />
            <input type="text" placeholder="Search conversations..." />
          </div>

          <div className="conversations-list">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.clientName.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="conversation-details">
                  <div className="conversation-header">
                    <span className="client-name">{conversation.clientName}</span>
                    <div className="message-type-indicator">
                      {conversation.type === 'sms' ? <Phone size={12} /> : <Mail size={12} />}
                    </div>
                  </div>
                  
                  <div className="last-message">
                    {conversation.lastMessage}
                  </div>
                  
                  <div className="conversation-meta">
                    <span className="message-time">{conversation.lastMessageTime}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages View */}
        <div className="messages-main">
          {selectedConversation ? (
            <>
              <div className="messages-header-bar">
                <h3>{selectedConversation.clientName}</h3>
                <div className="message-type-toggle">
                  <button
                    className={`type-btn ${messageType === 'sms' ? 'active' : ''}`}
                    onClick={() => setMessageType('sms')}
                  >
                    <Phone size={16} />
                    SMS
                  </button>
                  <button
                    className={`type-btn ${messageType === 'email' ? 'active' : ''}`}
                    onClick={() => setMessageType('email')}
                  >
                    <Mail size={16} />
                    Email
                  </button>
                </div>
              </div>

              <div className="messages-content">
                {selectedConversation.messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'trainer' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">{message.timestamp}</span>
                      <span className="message-type">
                        {message.type === 'sms' ? <Phone size={12} /> : <Mail size={12} />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-composer">
                <div className="composer-type">
                  <span className="send-via">
                    Send via {messageType.toUpperCase()}:
                  </span>
                </div>
                <div className="composer-input">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Type your ${messageType} message...`}
                    rows={3}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="send-button"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
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

      <div className="messages-info">
        <h4>Communication Features</h4>
        <ul>
          <li><strong>SMS Integration:</strong> Send text messages directly to clients</li>
          <li><strong>Email Notifications:</strong> Professional email communication via Resend API</li>
          <li><strong>Message History:</strong> Full conversation tracking and search</li>
          <li><strong>Quick Responses:</strong> Pre-written templates for common questions</li>
        </ul>
      </div>
    </div>
  );
};

export default TrainerMessages;
