/**
 * @file trainerService.js
 * @description Service layer for trainer-specific operations
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @project Felony Fitness
 */

import { supabase } from '../supabaseClient';

/**
 * Update client metrics in trainer_clients table
 * Merges new data with existing metrics JSON object
 * 
 * @param {string} clientId - UUID of the client in trainer_clients table
 * @param {string} category - Metric category ('strength', 'bodyComp', 'heartRate', 'macros')
 * @param {Object} data - The data object to save
 * @returns {Promise<Object>} Updated metrics object
 * @throws {Error} If update fails
 * 
 * @example
 * await updateClientMetrics(clientId, 'strength', {
 *   liftName: 'Bench Press',
 *   weight: 225,
 *   reps: 5,
 *   oneRepMax: 264,
 *   timestamp: new Date().toISOString()
 * });
 */
export const updateClientMetrics = async (clientId, category, data, inputs) => {
  if (!clientId || !category || !data) {
    throw new Error('Missing required parameters: clientId, category, and data are required');
  }

  try {
    // Fetch current metrics first
    const { data: client, error: fetchError } = await supabase
      .from('trainer_clients')
      .select('metrics')
      .eq('id', clientId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching client metrics:', fetchError);
      throw fetchError;
    }

    // Merge new data with timestamp
    const currentMetrics = client?.metrics || {};
    const timestampedData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    const updatedMetrics = { 
      ...currentMetrics, 
      [category]: timestampedData 
    };

    // Prepare the main update payload
    const updatePayload = {
      metrics: updatedMetrics,
      updated_at: new Date().toISOString()
    };

    // Add denormalized fields based on category
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
      if (inputs.age) updatePayload.age = parseInt(inputs.age);
      if (inputs.restingHR) updatePayload.resting_heart_rate = parseInt(inputs.restingHR);
      if (data.maxHR) updatePayload.calculated_max_hr = data.maxHR;
    }
    
    if (category === 'macros' && data) {
        if (data.protein?.g) updatePayload.calculated_protein_g = data.protein.g;
        if (data.fat?.g) updatePayload.calculated_fat_g = data.fat.g;
        if (data.carbs?.g) updatePayload.calculated_carbs_g = data.carbs.g;
    }

    // Save back to database
    const { error: updateError } = await supabase
      .from('trainer_clients')
      .update(updatePayload)
      .eq('id', clientId);
    
    if (updateError) {
      console.error('❌ Error updating client metrics:', updateError);
      throw updateError;
    }

    console.log('✅ Client metrics and denormalized columns updated successfully:', category);
    return updatedMetrics;
  } catch (error) {
    console.error('❌ Error in updateClientMetrics:', error);
    throw error;
  }
};

/**
 * Fetch client metrics from trainer_clients table
 * 
 * @param {string} clientId - UUID of the client in trainer_clients table
 * @returns {Promise<Object>} Metrics object or empty object
 * 
 * @example
 * const metrics = await getClientMetrics(clientId);
 * console.log(metrics.strength); // Access strength metrics
 */
export const getClientMetrics = async (clientId) => {
  if (!clientId) {
    throw new Error('clientId is required');
  }

  try {
    const { data, error } = await supabase
      .from('trainer_clients')
      .select('metrics')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('❌ Error fetching client metrics:', error);
      throw error;
    }

    return data?.metrics || {};
  } catch (error) {
    console.error('❌ Error in getClientMetrics:', error);
    throw error;
  }
};

/**
 * Fetch client details (notes + metrics) from trainer_clients row
 * @param {string} relationshipId - UUID of the trainer_clients row
 * @returns {Promise<Object>} { notes: string|null, metrics: Object }
 */
export const getClientDetails = async (relationshipId) => {
  if (!relationshipId) throw new Error('relationshipId is required');

  try {
    const { data, error } = await supabase
      .from('trainer_clients')
      .select('notes, metrics')
      .eq('id', relationshipId)
      .single();

    if (error) {
      console.error('❌ Error fetching client details:', error);
      throw error;
    }

    return {
      notes: data?.notes ?? null,
      metrics: data?.metrics || {}
    };
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
 * Delete a specific metric category from client profile
 * 
 * @param {string} clientId - UUID of the client
 * @param {string} category - Category to delete
 * @returns {Promise<Object>} Updated metrics object
 */
export const deleteClientMetric = async (clientId, category) => {
  if (!clientId || !category) {
    throw new Error('clientId and category are required');
  }

  try {
    const { data: client, error: fetchError } = await supabase
      .from('trainer_clients')
      .select('metrics')
      .eq('id', clientId)
      .single();

    if (fetchError) throw fetchError;

    const currentMetrics = client?.metrics || {};
    delete currentMetrics[category];

    const { error: updateError } = await supabase
      .from('trainer_clients')
      .update({ 
        metrics: currentMetrics,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);
    
    if (updateError) throw updateError;

    return currentMetrics;
  } catch (error) {
    console.error('❌ Error in deleteClientMetric:', error);
    throw error;
  }
};
