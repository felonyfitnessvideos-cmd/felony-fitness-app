/**
 * @file trainerService.js
 * @description Service layer for trainer-specific operations.
 * This version is refactored to work directly with denormalized columns
 * in the trainer_clients table, removing the dependency on a 'metrics' JSON blob.
 * @author Felony Fitness Development Team
 * @version 1.1.0
 * @project Felony Fitness
 */

import { supabase } from '../supabaseClient';

/**
 * Update denormalized client metric columns in the trainer_clients table.
 * 
 * @param {string} clientId - UUID of the client in trainer_clients table
 * @param {string} category - The category of metrics being updated ('bodyComp', 'heartRate', 'macros')
 * @param {Object} data - The calculated data object
 * @param {Object} inputs - The raw user inputs
 * @returns {Promise<Object>} The payload sent for the update
 * @throws {Error} If update fails
 */
export const updateClientMetrics = async (clientId, category, data, inputs) => {
  if (!clientId || !category || !data) {
    throw new Error('Missing required parameters: clientId, category, and data are required');
  }

  try {
    const updatePayload = {
      updated_at: new Date().toISOString()
    };

    // Add denormalized fields to payload based on the calculator category
    if (category === 'bodyComp' && inputs) {
      if (inputs.weight) updatePayload.weight = parseFloat(inputs.weight);
      if (inputs.height) updatePayload.height = parseFloat(inputs.height);
      if (inputs.gender) updatePayload.gender = inputs.gender;
      if (inputs.activityLevel) updatePayload.activity_level = parseFloat(inputs.activityLevel);
      if (inputs.bodyFat) updatePayload.body_fat_percentage = parseFloat(inputs.bodyFat);
      if (data.lbmLbs) updatePayload.lean_body_mass_lbs = data.lbmLbs;
      if (data.tdee) updatePayload.tdee = data.tdee;
    }

    if (category === 'heartRate' && inputs) {
      if (inputs.age) updatePayload.age = parseInt(inputs.age, 10);
      if (inputs.restingHR) updatePayload.resting_heart_rate = parseInt(inputs.restingHR, 10);
      if (data.maxHR) updatePayload.calculated_max_hr = data.maxHR;
    }
    
    if (category === 'macros' && data) {
        if (data.protein?.g) updatePayload.calculated_protein_g = data.protein.g;
        if (data.fat?.g) updatePayload.calculated_fat_g = data.fat.g;
        if (data.carbs?.g) updatePayload.calculated_carbs_g = data.carbs.g;
    }

    // Do not send an update to Supabase if only `updated_at` is present
    if (Object.keys(updatePayload).length <= 1) {
      // console.log(`No direct columns to update for category: ${category}. Skipping database call.`);
      return {};
    }

    // Save the updated columns back to the database
    const { error: updateError } = await supabase
      .from('trainer_clients')
      .update(updatePayload)
      .eq('id', clientId);
    
    if (updateError) {
      console.error('❌ Error updating client columns:', updateError);
      throw updateError;
    }

    // console.log(`✅ Client columns updated successfully for category: ${category}`);
    return updatePayload; // Return the payload that was sent
  } catch (error) {
    console.error('❌ Error in updateClientMetrics:', error);
    throw error;
  }
};

/**
 * @deprecated This function is deprecated as the 'metrics' column is no longer in use.
 * Fetches client metrics from trainer_clients table.
 * Returns an empty object to avoid breaking legacy calls.
 * 
 * @param {string} clientId - UUID of the client in trainer_clients table
 * @returns {Promise<Object>} Empty object
 */
export const getClientMetrics = async (clientId) => {
  if (!clientId) {
    return Promise.resolve({});
  }
  console.warn('`getClientMetrics` is deprecated as the `metrics` column is no longer in use. Fetch individual client columns instead.');
  return Promise.resolve({});
};

/**
 * Fetches client details (notes and calculator-related columns) from a trainer_clients row.
 * @param {string} relationshipId - UUID of the trainer_clients row
 * @returns {Promise<Object>} An object containing client details.
 */
export const getClientDetails = async (relationshipId) => {
  if (!relationshipId) throw new Error('relationshipId is required');

  try {
    const { data, error } = await supabase
      .from('trainer_clients')
      .select('notes, weight, height, gender, activity_level, body_fat_percentage, lean_body_mass_lbs, tdee, age, resting_heart_rate, date_of_birth, calculated_max_hr, calculated_protein_g, calculated_fat_g, calculated_carbs_g')
      .eq('id', relationshipId)
      .single();

    if (error) {
      console.error('❌ Error fetching client details:', error);
      throw error;
    }

    return data || {};
  } catch (error) {
    console.error('❌ Error in getClientDetails:', error);
    throw error;
  }
};


/**
 * Update notes for a trainer_clients row
 * @param {string} relationshipId - UUID of the trainer_clients row
 * @param {string|null} notes - Notes content to save
 * @returns {Promise<void>}
 */
export const updateClientNotes = async (relationshipId, notes) => {
  if (!relationshipId) throw new Error('relationshipId is required');

  try {
    const { error } = await supabase
      .from('trainer_clients')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', relationshipId);

    if (error) {
      console.error('❌ Error updating client notes:', error);
      throw error;
    }

    return;
  } catch (error) {
    console.error('❌ Error in updateClientNotes:', error);
    throw error;
  }
};

/**
 * @deprecated This function is deprecated as it operated on the 'metrics' JSON object.
 * To clear metrics, update the specific columns to null via a dedicated function if needed.
 * 
 * @param {string} clientId - UUID of the client
 * @param {string} category - Category to delete
 * @returns {Promise<Object>} Empty object
 */
export const deleteClientMetric = async (_clientId, _category) => {
  console.warn('`deleteClientMetric` is deprecated. To clear metrics, update the specific columns to null.');
  return Promise.resolve({});
};
