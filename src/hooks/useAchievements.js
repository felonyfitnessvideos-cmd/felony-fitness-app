/**
 * @fileoverview Custom React hook for managing gamification achievements and XP system
 * @description Provides polling-based achievement notification system with queue management
 * for displaying celebratory modals when users unlock new achievements. Designed to work
 * without real-time subscriptions using 30-second polling intervals.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-12-15
 * 
 * @requires React
 * @requires supabaseClient
 * 
 * Core Features:
 * - Automatic polling for new achievements every 30 seconds
 * - Queue management for multiple simultaneous achievements
 * - Graceful error handling for missing database tables (pre-migration state)
 * - Optimistic UI updates with background synchronization
 * - Achievement celebration modal coordination
 * 
 * Achievement System Architecture:
 * - **Database Triggers**: Automatically award achievements on specific actions
 *   - Workout completion: First Workout, consistency streaks, volume milestones
 *   - Nutrition logging: Nutrition tracking, daily consistency
 *   - PRs: Personal record achievements
 *   - Mesocycle completion: Program completion achievements
 * - **Polling Strategy**: 30-second intervals (Supabase real-time disabled)
 * - **Queue System**: Shows one achievement at a time, maintains FIFO order
 * - **Seen State**: Tracks which achievements user has viewed
 * 
 * @example
 * // Basic usage in App.jsx for global achievement notifications
 * function App() {
 *   const { user } = useAuth();
 *   const { currentAchievement, markAsSeen, hasUnseen } = useAchievements(user?.id);
 * 
 *   return (
 *     <>
 *       <Routes>...</Routes>
 *       {currentAchievement && (
 *         <AchievementUnlocked 
 *           achievement={currentAchievement.achievements}
 *           onClose={() => markAsSeen(currentAchievement.id)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * 
 * @example
 * // Access achievement queue status
 * const { queueLength, hasUnseen } = useAchievements(userId);
 * {hasUnseen && <Badge count={queueLength} />}
 * 
 * @see {@link ../components/achievements/AchievementUnlocked.jsx} for celebration modal
 * @see {@link ../../scripts/create-achievement-system.sql} for database schema
 */
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Custom hook for achievement management with polling-based updates
 * 
 * @function useAchievements
 * @param {string} userId - Authenticated user's UUID from Supabase Auth
 * @returns {Object} Achievement state and control functions
 * @returns {Object|null} returns.currentAchievement - Currently displayed achievement with full details
 * @returns {string} returns.currentAchievement.id - user_achievements.id for marking seen
 * @returns {string} returns.currentAchievement.unlocked_at - ISO timestamp of unlock
 * @returns {Object} returns.currentAchievement.achievements - Achievement details
 * @returns {string} returns.currentAchievement.achievements.code - Unique achievement code
 * @returns {string} returns.currentAchievement.achievements.name - Display name
 * @returns {string} returns.currentAchievement.achievements.description - Achievement description
 * @returns {string} returns.currentAchievement.achievements.icon - Lucide icon name
 * @returns {string} returns.currentAchievement.achievements.rarity - 'common'|'rare'|'epic'|'legendary'
 * @returns {number} returns.currentAchievement.achievements.xp_reward - XP points awarded
 * @returns {Function} returns.markAsSeen - Async function to mark achievement as seen and show next
 * @returns {boolean} returns.hasUnseen - True if there are unseen achievements in queue
 * @returns {number} returns.queueLength - Number of achievements waiting to be shown
 * 
 * @description
 * Manages the achievement notification queue by polling the database every 30 seconds
 * for new unseen achievements. When achievements are unlocked (via database triggers),
 * they appear in the queue and are shown one at a time. Calling markAsSeen() removes
 * the current achievement and displays the next one in FIFO order.
 * 
 * **Polling Behavior**:
 * - Initial check on mount when userId changes
 * - Subsequent checks every 30 seconds
 * - Stops polling when component unmounts (cleanup)
 * - Silently handles missing tables (pre-migration state)
 * 
 * **Error Handling**:
 * - Gracefully handles missing achievement tables
 * - Logs errors to console but never crashes
 * - Returns empty state if database not ready
 * 
 * **Performance Considerations**:
 * - Lightweight query (only unseen achievements)
 * - Ordered by unlock time (oldest first)
 * - Minimal re-renders (only on queue changes)
 */
export function useAchievements(userId) {
  /** @type {[Array<Object>, Function]} Queue of unseen achievements */
  const [newAchievements, setNewAchievements] = useState([]);
  
  /** @type {[Object|null, Function]} Currently displayed achievement (first in queue) */
  const [currentAchievement, setCurrentAchievement] = useState(null);

  /**
   * Check for unseen achievements on initial mount and userId changes
   * 
   * @description Queries user_achievements table for all achievements with seen=false,
   * ordered by unlock time (oldest first). Populates the achievement queue and sets
   * the first achievement as current. Gracefully handles missing tables during
   * development or pre-migration states.
   * 
   * @async
   * @inner
   */
  // Check for unseen achievements on mount and when userId changes
  useEffect(() => {
    if (!userId) return;

    /**
     * Fetch all unseen achievements from database
     * 
     * @description Queries user_achievements table with JOIN to achievements table
     * to get full achievement details including name, description, icon, rarity, and XP.
     * Filters for current user and unseen=false, ordered chronologically.
     * 
     * @async
     * @inner
     * @returns {Promise<void>}
     */
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

  /**
   * Poll for new achievements every 30 seconds
   * 
   * @description Sets up interval-based polling since Supabase real-time is disabled.
   * Checks every 30 seconds for new unseen achievements and updates the queue if
   * the count has changed. Only shows first achievement if none currently displayed.
   * 
   * **Why Polling**:
   * Real-time subscriptions are disabled on Supabase for cost optimization. Polling
   * provides acceptable UX for achievement notifications since they're not time-critical.
   * 
   * **Cleanup**:
   * Automatically clears interval on component unmount to prevent memory leaks.
   * 
   * @async
   * @inner
   */
  // Poll for new achievements every 30 seconds (real-time disabled)
  useEffect(() => {
    if (!userId) return;

    /**
     * Poll database for new achievements
     * 
     * @description Performs same query as initial check but compares count
     * with current queue length to detect new achievements. Updates queue
     * and shows first achievement if none currently visible.
     * 
     * @async
     * @inner
     * @returns {Promise<void>}
     */
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

    // Set up polling interval
    const interval = setInterval(pollForAchievements, 30000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [userId, currentAchievement, newAchievements.length]);

  /**
   * Mark achievement as seen and show next in queue
   * 
   * @async
   * @function markAsSeen
   * @param {string} achievementId - UUID of the user_achievement record to mark as seen
   * @returns {Promise<void>}
   * 
   * @description Updates the user_achievements table to set seen=true for the given
   * achievement, removes it from the local queue, and automatically shows the next
   * achievement if one exists. This is called when user closes the achievement modal.
   * 
   * **Database Update**:
   * - Sets seen=true in user_achievements table
   * - Permanently marks achievement as viewed
   * - Achievement won't appear in future queries
   * 
   * **Queue Management**:
   * - Removes achievement from local queue
   * - Advances to next achievement (FIFO)
   * - Sets currentAchievement to null if queue empty
   * 
   * **Error Handling**:
   * - Logs errors but never throws
   * - Continues showing remaining achievements even if update fails
   * 
   * @example
   * // In AchievementUnlocked modal
   * <button onClick={() => markAsSeen(achievement.id)}>
   *   Got it!
   * </button>
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
