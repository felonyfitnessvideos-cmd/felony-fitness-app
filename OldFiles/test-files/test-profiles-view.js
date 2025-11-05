import { supabase } from './src/supabaseClient.js';

// Test function to create the profiles view
const createProfilesView = async () => {
  try {
    console.log('🔧 Creating profiles view...');
    
    // Create the profiles view
    const { data, error } = await supabase
      .from('information_schema.views')
      .select('*')
      .eq('table_name', 'profiles');
    
    if (error) {
      console.error('❌ Error checking profiles view:', error);
      return;
    }
    
    console.log('📊 Current profiles view status:', data);
    
    // Try to query user_profiles to make sure it exists
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .limit(1);
    
    if (userProfilesError) {
      console.error('❌ Error querying user_profiles:', userProfilesError);
    } else {
      console.log('✅ user_profiles table exists:', userProfiles?.length || 0, 'records found');
    }
    
    // Test the existing profiles query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error querying profiles (expected):', profilesError);
    } else {
      console.log('✅ profiles table/view exists:', profiles?.length || 0, 'records found');
    }
    
  } catch (error) {
    console.error('❌ Error in createProfilesView:', error);
  }
};

// Run the test
createProfilesView();

// Export for browser console use
window.createProfilesView = createProfilesView;