// Quick test to check trainer-clients data using direct Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('Looking for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testTrainerClients = async () => {
    const trainerId = '9561bcc5-428c-47e4-b53b-ff978125b767';
    
    console.log('=== Testing direct trainer_clients table ===');
    
    try {
        const { data: directData, error: directError } = await supabase
            .from('trainer_clients')
            .select('*');;
            
        if (directError) {
            console.error('Direct Query Error:', directError);
        } else {
            console.log('All trainer_clients records:', directData);
            
            const myRecords = directData.filter(record => 
                record.trainer_id === trainerId || record.client_id === trainerId
            );
            console.log('My records (as trainer or client):', myRecords);
        }
    } catch (err) {
        console.error('Direct Query Error:', err);
    }
    
    process.exit(0);
};

testTrainerClients();