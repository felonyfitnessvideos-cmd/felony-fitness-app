/**
 * @file ClientMessaging.jsx
 * @description Messaging component visible only to users with Client role
 * @author Felony Fitness Development Team
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { useUserRoles } from '../hooks/useUserRoles.js';
import { supabase } from '../supabaseClient.js';

const ClientMessaging = () => {
    const { user } = useAuth();
    const { isClient, loading: rolesLoading } = useUserRoles();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load trainers and messages
    useEffect(() => {
        if (user && isClient) {
            loadTrainers();
        }
    }, [user, isClient]);

    const loadTrainers = async () => {
        try {
            // TEMP FIX: Simple query without embedded relationships to avoid schema cache issues
            const { data: relationships, error } = await supabase
                .from('trainer_clients')
                .select('trainer_id')
                .eq('client_id', user.id)
                .eq('relationship_status', 'active');

            if (error) throw error;

            // Get trainer details separately to avoid schema cache issues
            const trainerIds = relationships?.map(rel => rel.trainer_id) || [];
            
            if (trainerIds.length === 0) {
                setTrainers([]);
                return;
            }

            // Get trainer emails from auth.users (bypassing schema cache issues)
            // Create trainer list with proper display names
            const trainersList = trainerIds.map(trainerId => {
                // For self-testing (when trainer ID equals user ID), show a friendly name
                const displayName = trainerId === user.id ? 'Your Trainer (David)' : `Trainer ${trainerId.slice(0, 8)}`;
                
                return {
                    id: trainerId,
                    email: displayName
                };
            });

            setTrainers(trainersList);
            
            // Auto-select first trainer if available
            if (trainersList.length > 0 && !selectedTrainer) {
                setSelectedTrainer(trainersList[0]);
            }
        } catch (error) {
            console.error('Error loading trainers:', error);
        }
    };

    const loadMessages = async (trainerId) => {
        if (!trainerId) return;
        
        try {
            const { data, error } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},recipient_id.eq.${trainerId}),and(sender_id.eq.${trainerId},recipient_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    useEffect(() => {
        if (selectedTrainer) {
            loadMessages(selectedTrainer.id);
        }
    }, [selectedTrainer, user]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTrainer || loading) return;

        setLoading(true);
        try {
            // Import and use the proper messaging utilities
            const { sendMessage: sendMessageUtil } = await import('../utils/messagingUtils.js');
            
            await sendMessageUtil(selectedTrainer.id, newMessage.trim());

            // Clear the input and reload messages
            setNewMessage('');
            
            // Reload messages to show the new message
            loadMessages(selectedTrainer.id);
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Failed to send message: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Don't render if user is not a client
    if (rolesLoading) {
        return <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>Loading permissions...</div>;
    }

    if (!isClient) {
        return null; // Hidden from non-clients
    }

    if (trainers.length === 0) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                color: '#888'
            }}>
                <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>No Trainers Yet</h3>
                <p style={{ margin: 0 }}>You haven't been assigned to any trainers yet. Once a trainer adds you as a client, you'll be able to message them here.</p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 107, 53, 0.1)',
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MessageSquare size={20} style={{ color: '#ff6b35' }} />
                    <h3 style={{ margin: 0, color: 'white' }}>
                        {trainers.length === 1 ? `Message ${selectedTrainer?.email || 'Trainer'}` : 'Messages'}
                    </h3>
                </div>
                
                {/* Trainer selector */}
                {trainers.length > 1 && (
                    <select
                        value={selectedTrainer?.id || ''}
                        onChange={(e) => {
                            const trainer = trainers.find(t => t.id === e.target.value);
                            setSelectedTrainer(trainer);
                        }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            color: 'white',
                            fontSize: '0.875rem'
                        }}
                    >
                        {trainers.map(trainer => (
                            <option key={trainer.id} value={trainer.id} style={{ background: '#1a1a1a' }}>
                                {trainer.email}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Messages */}
            <div style={{
                height: '200px',
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>
                        <p>No messages yet. Start a conversation with your trainer!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                display: 'flex',
                                justifyContent: message.sender_id === user.id ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div style={{
                                maxWidth: '70%',
                                background: message.sender_id === user.id ? '#ff6b35' : 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: message.sender_id === user.id ? '4px' : '12px',
                                borderBottomLeftRadius: message.sender_id === user.id ? '12px' : '4px'
                            }}>
                                <div style={{ fontSize: '0.875rem' }}>
                                    {message.content}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    opacity: 0.7,
                                    marginTop: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    <Clock size={10} />
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} style={{
                padding: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '0.5rem'
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedTrainer?.email || 'trainer'}...`}
                    disabled={loading}
                    style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        color: 'white',
                        fontSize: '0.875rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    style={{
                        background: loading || !newMessage.trim() ? '#666' : '#ff6b35',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        padding: '0.75rem',
                        cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};

export default ClientMessaging;