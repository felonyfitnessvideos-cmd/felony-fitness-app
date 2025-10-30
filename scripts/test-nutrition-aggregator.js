/**
 * @file scripts/test-nutrition-aggregator.js
 * @description Test the nutrition aggregator edge function
 */

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

async function testNutritionAggregator() {
  console.log('🧪 Testing nutrition aggregator edge function...\n');

  try {
    console.log('📍 Testing with anon key...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-aggregator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'chicken breast',
        sources: ['usda'],
        max_results: 2
      })
    });

    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error response:');
      console.log(error);
      
      // Try without authentication to see if function works
      console.log('\n📍 Testing without auth header...');
      const noAuthResponse = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-aggregator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'chicken breast',
          sources: ['usda'],
          max_results: 2
        })
      });
      
      console.log(`No-auth Status: ${noAuthResponse.status}`);
      const noAuthError = await noAuthResponse.text();
      console.log('No-auth Response:', noAuthError);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Check if API keys are likely configured
async function checkApiKeyStatus() {
  console.log('\n🔑 Checking API key configuration...');
  
  // This will fail but might give us clues about what's configured
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-aggregator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'test',
        sources: ['invalid_source'] // This should cause a different error if auth works
      })
    });
    
    const data = await response.text();
    console.log('API key test response:', data);
    
  } catch (error) {
    console.log('API key test error:', error.message);
  }
}

// Run tests
testNutritionAggregator()
  .then(() => checkApiKeyStatus())
  .catch(console.error);