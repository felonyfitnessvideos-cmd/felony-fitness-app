import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('Running migration to add food_id column...\n');
  
  const sql = fs.readFileSync('add-food-id-column.sql', 'utf8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Migration failed:', error);
    
    // Try direct approach
    console.log('\n Trying direct SQL execution...');
    
    try {
      // Execute each statement separately
      const statements = sql.split(';').filter(s => s.trim());
      
      for (const stmt of statements) {
        if (!stmt.trim()) continue;
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        
        const response = await fetch(
          `${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql_query: stmt })
          }
        );
        
        if (!response.ok) {
          const text = await response.text();
          console.error(`Failed: ${text}`);
        } else {
          console.log('✅ Success');
        }
      }
    } catch (err) {
      console.error('Direct execution also failed:', err.message);
      console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
      console.log('https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql/new\n');
      console.log(sql);
    }
  } else {
    console.log('✅ Migration successful!', data);
  }
}

runMigration();
