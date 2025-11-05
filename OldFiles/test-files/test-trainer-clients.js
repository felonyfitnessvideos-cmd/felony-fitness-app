// Quick test to check trainer-clients data
import { supabase } from './src/supabaseClient.js';

const testTrainerClients = async () => {
    const trainerId = '9561bcc5-428c-47e4-b53b-ff978125b767';
    
    console.log('=== Testing get_trainer_clients function ===');
    
    try {
        const { data, error } = await supabase.rpc('get_trainer_clients', {
            trainer_user_id: trainerId
        });
        
        if (error) {
            console.error('RPC Error:', error);
        } else {
            console.log('RPC Data:', data);
        }
    } catch (err) {
        console.error('Function Error:', err);
    }
    
    console.log('\n=== Testing direct trainer_clients table ===');
    
    try {
        const { data: directData, error: directError } = await supabase
            .from('trainer_clients')
            .select('*')
            .eq('trainer_id', trainerId);
            
        if (directError) {
            console.error('Direct Query Error:', directError);
        } else {
            console.log('Direct Query Data:', directData);
        }
    } catch (err) {
        console.error('Direct Query Error:', err);
    }
    
    console.log('\n=== Testing user_profiles table ===');
    
    try {
        const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', trainerId);
            
        if (profilesError) {
            console.error('Profiles Query Error:', profilesError);
        } else {
            console.log('Profiles Data:', profilesData);
        }
    } catch (err) {
        console.error('Profiles Query Error:', err);
    }
    
    process.exit(0);
};

testTrainerClients();