// FILE: seed-exercises.js
// DESCRIPTION: Final production-ready version with the correct image property name.

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const WGER_API_KEY = process.env.WGER_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!WGER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fetchAllPages(url, apiKey) {
  let results = [];
  let nextUrl = url;
  while (nextUrl) {
    const response = await fetch(nextUrl, { headers: { 'Authorization': `Token ${apiKey}` } });
    const data = await response.json();
    results = results.concat(data.results);
    nextUrl = data.next;
  }
  return results;
}

async function seedExercises() {
  try {
    console.log("Fetching data from WGER API (all pages)...");

    const [allExercises, allImages] = await Promise.all([
      fetchAllPages('https://wger.de/api/v2/exerciseinfo/?language=2', WGER_API_KEY),
      fetchAllPages('https://wger.de/api/v2/exerciseimage/?is_main=True', WGER_API_KEY)
    ]);
    
    console.log(`Found ${allExercises.length} total exercises and ${allImages.length} total main images.`);

    const imageMap = new Map();
    for (const image of allImages) {
      // --- THE FINAL FIX IS HERE ---
      // The correct property from the API is 'exercise', not 'exercise_base'.
      imageMap.set(image.exercise, image.image);
    }

    console.log(`Image map created with ${imageMap.size} entries.`);

    const formattedExercises = allExercises
      .map(exercise => {
        const englishTranslation = exercise.translations.find(t => t.language === 2);
        if (!englishTranslation || !englishTranslation.name) {
          return null;
        }
        const cleanedDescription = (englishTranslation.description || '').replace(/<[^>]*>/g, '');
        const imageUrl = imageMap.get(exercise.id) || null;
        return {
          name: englishTranslation.name,
          description: cleanedDescription,
          category_id: exercise.category.id, 
          thumbnail_url: imageUrl,
        };
      })
      .filter(exercise => exercise !== null);

    console.log(`Formatted ${formattedExercises.length} exercises to be saved.`);

    const uniqueExercises = [];
    const namesSeen = new Set();
    for (const exercise of formattedExercises) {
      if (!namesSeen.has(exercise.name)) {
        uniqueExercises.push(exercise);
        namesSeen.add(exercise.name);
      }
    }
    console.log(`De-duplicated down to ${uniqueExercises.length} unique exercises.`);

    if (uniqueExercises.length === 0) {
      console.log("No exercises were formatted. Halting before saving to Supabase.");
      return;
    }
    
    const { error } = await supabase
      .from('exercises')
      .upsert(uniqueExercises, { onConflict: 'name' });

    if (error) { throw error; }

    console.log("✅ Successfully seeded exercises table in Supabase!");

  } catch (error) {
    console.error("❌ Error seeding exercises:", error.message);
  }
}

seedExercises();