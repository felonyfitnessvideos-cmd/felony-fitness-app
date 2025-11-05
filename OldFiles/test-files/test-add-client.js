// Test the add_client_to_trainer function
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const testAddClient = async () => {
    const userId = '9561bcc5-428c-47e4-b53b-ff978125b767';
    
    console.log('=== Testing add_client_to_trainer function ===');
    
    try {
        // Try to add yourself as your own client (for testing)
        const { data, error } = await supabase.rpc('add_client_to_trainer', {
            trainer_user_id: userId,
            client_user_id: userId
        });
        
        if (error) {
            console.error('Add Client Error:', error);
        } else {
            console.log('Add Client Success:', data);
        }
    } catch (err) {
        console.error('Function Error:', err);
    }
    
    // Check the table after
    console.log('\n=== Checking trainer_clients table after ===');
    try {
        const { data: afterData, error: afterError } = await supabase
            .from('trainer_clients')
            .select('*');
            
        if (afterError) {
            console.error('After Query Error:', afterError);
        } else {
            console.log('Records after add:', afterData);
        }
    } catch (err) {
        console.error('After Query Error:', err);
    }
    
    process.exit(0);
};

testAddClient();