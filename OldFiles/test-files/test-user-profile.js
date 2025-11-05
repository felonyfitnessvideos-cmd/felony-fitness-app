// Quick test to check user profile data
import { supabase } from './src/supabaseClient.js';

async function checkUserProfiles() {
    try {
        console.log('🔍 Checking current user...');
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Current user:', user);
        
        if (user) {
            console.log('🔍 Checking user profile...');
            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            console.log('📊 User profile:', profile);
            console.log('❌ Profile error:', error);
            
            console.log('🔍 Checking trainer-client relationships...');
            const { data: relationships, error: relError } = await supabase
                .from('trainer_clients')
                .select('*')
                .eq('trainer_id', user.id);
            
            console.log('🔗 Relationships:', relationships);
            console.log('❌ Relationship error:', relError);
        }
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

checkUserProfiles();