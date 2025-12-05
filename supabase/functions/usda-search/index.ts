/**
 * @file supabase/functions/usda-search/index.ts
 * @description Simple, fast food search using local USDA database
 * 
 * NO EXTERNAL APIs - Direct PostgreSQL full-text search
 * NO ENRICHMENT - Data comes pre-complete from USDA
 * NO WORKERS - Everything is already in the database
 * 
 * SEARCH FEATURES:
 * - Full-text search with PostgreSQL FTS
 * - Fuzzy matching with pg_trgm (trigram similarity)
 * - Brand-aware search (searches brand_owner, brand_name, description)
 * - Category filtering
 * - Data type filtering (branded, foundation, sr_legacy)
 * 
 * USAGE:
 *   POST /usda-search
 *   Body: { 
 *     "query": "chicken breast",
 *     "limit": 50,
 *     "data_types": ["branded_food", "foundation_food"],
 *     "category": "Meat & Poultry"
 *   }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SearchRequest {
  query: string
  limit?: number
  data_types?: string[]
  category?: string
}

interface SearchResult {
  id: string
  fdc_id: number
  description: string
  brand_owner: string | null
  brand_name: string | null
  data_type: string
  category: string
  
  // Serving info
  serving_size: number | null
  serving_size_unit: string | null
  household_serving_fulltext: string | null
  
  // Macros
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  sodium_mg: number
  
  // Relevance
  similarity?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    
    // Parse request
    const { query, limit = 50, data_types, category }: SearchRequest = await req.json()
    
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Searching for: "${query}" (limit: ${limit})`)

    // Build query
    let dbQuery = supabase
      .from('food_servings')
      .select(`
        id,
        fdc_id,
        description,
        brand_owner,
        brand_name,
        data_type,
        category,
        serving_size,
        serving_size_unit,
        household_serving_fulltext,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        fiber_g,
        sugar_g,
        sodium_mg
      `)

    // Text search: Use textSearch for full-text search OR ilike for simple matching
    const searchTerm = query.toLowerCase().trim()
    
    // Apply filters using OR condition (search in multiple columns)
    dbQuery = dbQuery.or(
      `description.ilike.%${searchTerm}%,` +
      `brand_owner.ilike.%${searchTerm}%,` +
      `brand_name.ilike.%${searchTerm}%`
    )

    // Filter by data types if specified
    if (data_types && data_types.length > 0) {
      dbQuery = dbQuery.in('data_type', data_types)
    }

    // Filter by category if specified
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    // Limit results
    dbQuery = dbQuery.limit(limit)

    // Execute query
    const { data: results, error } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log(`✅ Found ${results.length} results`)

    // Sort results by relevance (simple scoring based on match position)
    const scoredResults = results.map(food => {
      let score = 0
      const lowerDesc = food.description.toLowerCase()
      const lowerBrand = (food.brand_name || '').toLowerCase()
      const lowerOwner = (food.brand_owner || '').toLowerCase()
      
      // Exact match in description = highest score
      if (lowerDesc === searchTerm) {
        score += 100
      }
      // Starts with search term = high score
      else if (lowerDesc.startsWith(searchTerm)) {
        score += 50
      }
      // Contains search term = medium score
      else if (lowerDesc.includes(searchTerm)) {
        score += 25
      }
      
      // Bonus for brand matches
      if (lowerBrand.includes(searchTerm)) score += 15
      if (lowerOwner.includes(searchTerm)) score += 10
      
      // Bonus for foundation foods (USDA reference data is highest quality)
      if (food.data_type === 'foundation_food') score += 5
      
      return {
        ...food,
        similarity: score
      }
    })

    // Sort by similarity score
    scoredResults.sort((a, b) => b.similarity - a.similarity)

    return new Response(
      JSON.stringify({
        success: true,
        query,
        total: scoredResults.length,
        results: scoredResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Search error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
