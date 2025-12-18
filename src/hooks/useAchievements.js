import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Achievement Management Hook
 * Handles checking for new achievements and real-time subscriptions
 * 
 * @param {string} userId - Current user's ID
 * @returns {Object} Achievement state and functions
 */
export function useAchievements(userId) {
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Check for unseen achievements on mount and when userId changes
  useEffect(() => {
    if (!userId) return;

    async function checkUnseenAchievements() {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            unlocked_at,
            achievements (
              code,
              name,
              description,
              icon,
              rarity,
              xp_reward
            )
          `)
          .eq('user_id', userId)
          .eq('seen', false)
          .order('unlocked_at', { ascending: true });

        if (error) {
          // Silently handle if table doesn't exist yet
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.log('Achievement tables not yet created. Run the SQL migration first.');
            return;
          }
          console.error('Error fetching unseen achievements:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log('Found unseen achievements:', data.length);
          setNewAchievements(data);
          setCurrentAchievement(data[0]); // Show first one
        }
      } catch (error) {
        console.error('Error in checkUnseenAchievements:', error);
      }
    }

    checkUnseenAchievements();
  }, [userId]);

  // Poll for new achievements every 30 seconds (real-time disabled)
  useEffect(() => {
    if (!userId) return;

    async function pollForAchievements() {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            unlocked_at,
            achievements (
              code,
              name,
              description,
              icon,
              rarity,
              xp_reward
            )
          `)
          .eq('user_id', userId)
          .eq('seen', false)
          .order('unlocked_at', { ascending: true });

        if (error) {
          // Silently handle if table doesn't exist
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            return;
          }
          console.error('Error polling achievements:', error);
          return;
        }

        if (data && data.length > 0 && data.length !== newAchievements.length) {
          console.log('🎉 Found new achievements!', data.length);
          setNewAchievements(data);
          if (!currentAchievement) {
            setCurrentAchievement(data[0]);
          }
        }
      } catch {
        // Silent fail
      }
    }

    const interval = setInterval(pollForAchievements, 30000);
    return () => clearInterval(interval);
  }, [userId, currentAchievement, newAchievements.length]);

  /**
   * Mark achievement as seen and show next in queue
   */
  const markAsSeen = async (achievementId) => {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .update({ seen: true })
        .eq('id', achievementId);

      if (error) {
        console.error('Error marking achievement as seen:', error);
        return;
      }

      console.log('Marked achievement as seen:', achievementId);

      // Remove from queue and show next
      const remaining = newAchievements.filter(a => a.id !== achievementId);
      setNewAchievements(remaining);
      setCurrentAchievement(remaining[0] || null);
    } catch (error) {
      console.error('Error in markAsSeen:', error);
    }
  };

  return {
    currentAchievement,
    markAsSeen,
    hasUnseen: newAchievements.length > 0,
    queueLength: newAchievements.length
  };
}
