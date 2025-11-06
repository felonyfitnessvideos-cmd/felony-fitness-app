/**
 * @file test-edge-functions.js
 * @description Test script for Trainer Dashboard edge functions
 * @project Felony Fitness
 * 
 * Tests the following edge functions:
 * - get-conversations
 * - get-conversation-messages
 * - send-direct-message
 * - mark-messages-as-read
 * - get-unread-message-count
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.development') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.development');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test result object
 */
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Helper to log test results
 */
function logTest(name, passed, message, data = null) {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}: ${message}`);
    if (data) {
        console.log('   Data:', JSON.stringify(data, null, 2).split('\n').join('\n   '));
    }

    testResults.tests.push({ name, passed, message, data });
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
}

/**
 * Test 1: Get Conversations
 */
async function testGetConversations() {
    console.log('\n📋 Test 1: get-conversations');
    try {
        const { data, error } = await supabase.functions.invoke('get-conversations', {
            body: {}
        });

        if (error) {
            logTest('get-conversations', false, `Error: ${error.message}`, error);
            return;
        }

        if (!data) {
            logTest('get-conversations', false, 'No data returned');
            return;
        }

        if (data.error) {
            logTest('get-conversations', false, `Function error: ${data.error}`, data);
            return;
        }

        if (!Array.isArray(data.conversations)) {
            logTest('get-conversations', false, 'Expected conversations array', data);
            return;
        }

        logTest(
            'get-conversations',
            true,
            `Returned ${data.conversations.length} conversations`,
            data.conversations.length > 0 ? data.conversations[0] : 'No conversations'
        );
    } catch (err) {
        logTest('get-conversations', false, `Exception: ${err.message}`, err);
    }
}

/**
 * Test 2: Get Conversation Messages
 */
async function testGetConversationMessages() {
    console.log('\n💬 Test 2: get-conversation-messages');

    // First, get a conversation to test with
    try {
        const { data: convData } = await supabase.functions.invoke('get-conversations');

        if (!convData?.conversations || convData.conversations.length === 0) {
            logTest('get-conversation-messages', false, 'No conversations available to test with (skipped)');
            return;
        }

        const testUserId = convData.conversations[0].user_id;

        const { data, error } = await supabase.functions.invoke('get-conversation-messages', {
            body: { otherUserId: testUserId }
        });

        if (error) {
            logTest('get-conversation-messages', false, `Error: ${error.message}`, error);
            return;
        }

        if (!data) {
            logTest('get-conversation-messages', false, 'No data returned');
            return;
        }

        if (data.error) {
            logTest('get-conversation-messages', false, `Function error: ${data.error}`, data);
            return;
        }

        if (!Array.isArray(data.messages)) {
            logTest('get-conversation-messages', false, 'Expected messages array', data);
            return;
        }

        logTest(
            'get-conversation-messages',
            true,
            `Returned ${data.messages.length} messages for user ${testUserId}`,
            data.messages.length > 0 ? data.messages[0] : 'No messages'
        );
    } catch (err) {
        logTest('get-conversation-messages', false, `Exception: ${err.message}`, err);
    }
}

/**
 * Test 3: Get Unread Message Count
 */
async function testGetUnreadMessageCount() {
    console.log('\n🔔 Test 3: get-unread-message-count');
    try {
        const { data, error } = await supabase.functions.invoke('get-unread-message-count', {
            body: {}
        });

        if (error) {
            logTest('get-unread-message-count', false, `Error: ${error.message}`, error);
            return;
        }

        if (!data) {
            logTest('get-unread-message-count', false, 'No data returned');
            return;
        }

        if (data.error) {
            logTest('get-unread-message-count', false, `Function error: ${data.error}`, data);
            return;
        }

        if (typeof data.count !== 'number') {
            logTest('get-unread-message-count', false, 'Expected count number', data);
            return;
        }

        logTest(
            'get-unread-message-count',
            true,
            `Unread message count: ${data.count}`,
            data
        );
    } catch (err) {
        logTest('get-unread-message-count', false, `Exception: ${err.message}`, err);
    }
}

/**
 * Test 4: Check Edge Function Deployment Status
 */
async function testDeploymentStatus() {
    console.log('\n🚀 Test 4: Edge Function Deployment Status');

    const functions = [
        // Messaging functions
        'get-conversations',
        'get-conversation-messages',
        'send-direct-message',
        'mark-messages-as-read',
        'get-unread-message-count',
        // User/Client management functions
        'user-has-tag',
        'get-user-tags',
        'assign-user-tag',
        'remove-user-tag',
        'add-client-to-trainer'
    ];

    for (const funcName of functions) {
        try {
            const { data, error } = await supabase.functions.invoke(funcName, {
                body: {}
            });

            // We just want to see if the function exists and responds
            // Even error responses mean it's deployed
            const deployed = !error || error.message !== 'Function not found';

            logTest(
                `deployment-${funcName}`,
                deployed,
                deployed ? 'Function is deployed' : 'Function not found'
            );
        } catch (err) {
            logTest(
                `deployment-${funcName}`,
                false,
                `Unable to reach function: ${err.message}`
            );
        }
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🧪 Starting Trainer Dashboard Edge Function Tests\n');
    console.log('Environment:', {
        url: supabaseUrl,
        keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
    });

    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.log('\n⚠️  No authenticated user. Some tests require authentication.');
        console.log('   Please sign in to the app first to run full tests.\n');
    } else {
        console.log('\n✅ Authenticated as:', user.email, '\n');
    }

    // Run tests
    await testDeploymentStatus();
    await testGetConversations();
    await testGetConversationMessages();
    await testGetUnreadMessageCount();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log('='.repeat(60));

    if (testResults.failed > 0) {
        console.log('\n⚠️  Some tests failed. Review the output above for details.');
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}

// Run the tests
runTests().catch((err) => {
    console.error('💥 Fatal error running tests:', err);
    process.exit(1);
});
