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
export const updateClientMetrics = async (clientId, category, data) => {
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

    // Save back to database
    const { error: updateError } = await supabase
      .from('trainer_clients')
      .update({ 
        metrics: updatedMetrics,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);
    
    if (updateError) {
      console.error('❌ Error updating client metrics:', updateError);
      throw updateError;
    }

    console.log('✅ Client metrics updated successfully:', category);
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
