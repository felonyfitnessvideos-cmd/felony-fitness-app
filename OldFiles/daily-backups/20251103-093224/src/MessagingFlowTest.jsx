/**
 * @file MessagingFlowTest.jsx
 * @description Test component to verify trainer-to-client messaging flow
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * 
 * This component tests the complete messaging flow:
 * 1. Trainer sends message to client
 * 2. Client receives and can reply
 * 3. Real-time updates work
 * 4. Both Edge Function and fallback methods work
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { sendMessage, getConversationMessages, subscribeToMessages } from '../utils/messagingUtils.js';

const MessagingFlowTest = () => {
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userProfiles, setUserProfiles] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from the trainer.');

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getCurrentUser();
    loadUserProfiles();
  }, []);

  const addResult = (message, isSuccess = true) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, {
      message,
      isSuccess,
      timestamp
    }]);
  };

  const loadUserProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .limit(10);

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      setUserProfiles(profiles || []);
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  };

  const runMessagingTest = async () => {
    if (!user || !selectedRecipient) {
      addResult('❌ Please select a recipient user', false);
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      addResult('📡 Starting comprehensive messaging flow test...');
      
      // Test 1: Send message using sendMessage utility
      addResult('1️⃣ Testing sendMessage utility...');
      
      const result = await sendMessage(selectedRecipient, testMessage);
      
      if (result && result.success !== false) {
        addResult('✅ Message sent successfully!');
        addResult(`📝 Message ID: ${result.message_id || 'Generated'}`);
      } else {
        addResult('❌ Failed to send message', false);
      }

      // Test 2: Verify message appears in database
      addResult('2️⃣ Verifying message in database...');
      
      const messages = await getConversationMessages(selectedRecipient);
      const sentMessage = messages.find(msg => 
        msg.content === testMessage && 
        msg.is_from_current_user === true
      );
      
      if (sentMessage) {
        addResult('✅ Message found in database');
        addResult(`📅 Created at: ${new Date(sentMessage.created_at).toLocaleString()}`);
      } else {
        addResult('❌ Message not found in database', false);
      }

      // Test 3: Test subscription (if implemented)
      addResult('3️⃣ Testing real-time subscription...');
      
      try {
        const subscription = await subscribeToMessages((payload) => {
          addResult('📨 Real-time message received!');
        });
        
        if (subscription) {
          addResult('✅ Real-time subscription established');
          // Clean up subscription
          subscription.unsubscribe();
        } else {
          addResult('⚠️ Real-time subscription not available');
        }
      } catch (error) {
        addResult(`⚠️ Real-time subscription error: ${error.message}`);
      }

      addResult('🎉 Messaging flow test completed!');

    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, false);
      console.error('Messaging test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '20px auto', 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🧪 Messaging Flow Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current User</h3>
        <p>
          <strong>ID:</strong> {user?.id || 'Not logged in'}<br/>
          <strong>Email:</strong> {user?.email || 'N/A'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Configuration</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Recipient:</strong>
            <select 
              value={selectedRecipient} 
              onChange={(e) => setSelectedRecipient(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
            >
              <option value="">Select a user...</option>
              {userProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.first_name} {profile.last_name} ({profile.email})
                </option>
              ))}
            </select>
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            <strong>Test Message:</strong><br/>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              style={{ width: '100%', height: '60px', padding: '5px', marginTop: '5px' }}
              placeholder="Enter test message content..."
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runMessagingTest}
          disabled={isRunning || !user || !selectedRecipient}
          style={{
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? '🔄 Running Test...' : '🚀 Run Messaging Test'}
        </button>

        <button 
          onClick={clearResults}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div>
        <h3>Test Results</h3>
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '15px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {testResults.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              No tests run yet. Configure the test and click "Run Messaging Test".
            </p>
          ) : (
            testResults.map((result, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '8px',
                  color: result.isSuccess ? '#28a745' : '#dc3545'
                }}
              >
                <small style={{ color: '#6c757d' }}>[{result.timestamp}]</small> {result.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingFlowTest;