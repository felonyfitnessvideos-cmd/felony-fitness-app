/**
 * @file testRoleSystem.js
 * @description Test script to verify the role system is working correctly
 * @author Felony Fitness Development Team
 */

import { supabase } from './src/supabaseClient.js';

async function testRoleSystem() {
    try {
        console.log('🚀 Testing Role System...\n');
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('❌ No authenticated user found. Please log in first.');
            return;
        }
        
        console.log(`✅ Current user: ${user.email} (${user.id})\n`);
        
        // 1. Check current tags
        console.log('1️⃣ Checking current user tags...');
        const { data: currentTags, error: tagsError } = await supabase.rpc('get_user_tags', {
            target_user_id: user.id
        });
        
        if (tagsError) {
            console.error('❌ Error getting user tags:', tagsError);
        } else {
            console.log('Current tags:', currentTags || []);
        }
        
        // 2. Assign Trainer role
        console.log('\n2️⃣ Assigning Trainer role...');
        const { data: trainerResult, error: trainerError } = await supabase.rpc('assign_user_tag', {
            target_user_id: user.id,
            tag_name: 'Trainer',
            assigned_by_user_id: user.id
        });
        
        if (trainerError) {
            console.error('❌ Error assigning Trainer role:', trainerError);
        } else {
            console.log('✅ Trainer role assigned:', trainerResult);
        }
        
        // 3. Add yourself as your own client (this should auto-assign Client tag)
        console.log('\n3️⃣ Adding yourself as your own client...');
        const { data: clientResult, error: clientError } = await supabase.rpc('add_client_to_trainer', {
            trainer_user_id: user.id,
            client_user_id: user.id,
            relationship_notes: 'Self-testing trainer-client relationship'
        });
        
        if (clientError) {
            console.error('❌ Error adding client relationship:', clientError);
        } else {
            console.log('✅ Client relationship created:', clientResult);
        }
        
        // 4. Check updated tags
        console.log('\n4️⃣ Checking updated user tags...');
        const { data: updatedTags, error: updatedTagsError } = await supabase.rpc('get_user_tags', {
            target_user_id: user.id
        });
        
        if (updatedTagsError) {
            console.error('❌ Error getting updated tags:', updatedTagsError);
        } else {
            console.log('Updated tags:', updatedTags || []);
        }
        
        // 5. Test messaging system
        console.log('\n5️⃣ Testing messaging system...');
        const testMessage = {
            recipient_id: user.id,
            content: 'Hello! This is a test message from the trainer role to the client role.'
        };
        
        const { data: messageResult, error: messageError } = await supabase
            .from('direct_messages')
            .insert([{
                sender_id: user.id,
                recipient_id: user.id,
                content: testMessage.content
            }])
            .select();
        
        if (messageError) {
            console.error('❌ Error sending test message:', messageError);
        } else {
            console.log('✅ Test message sent:', messageResult);
        }
        
        // 6. Verify trainer-client relationship
        console.log('\n6️⃣ Checking trainer-client relationships...');
        const { data: relationships, error: relationshipError } = await supabase
            .from('trainer_clients')
            .select('*')
            .eq('trainer_id', user.id);
        
        if (relationshipError) {
            console.error('❌ Error getting relationships:', relationshipError);
        } else {
            console.log('✅ Trainer-client relationships:', relationships);
        }
        
        console.log('\n🎉 Role system test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testRoleSystem();