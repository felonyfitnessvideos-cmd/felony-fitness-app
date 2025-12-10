import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
  // Get nutrition_logs columns
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('nutrition_logs columns:', data && data[0] ? Object.keys(data[0]) : []);
  }
}

checkSchema();
