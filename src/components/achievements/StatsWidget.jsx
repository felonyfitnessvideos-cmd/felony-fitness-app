import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Trophy, Zap, TrendingUp, Target } from 'lucide-react';
import './StatsWidget.css';

/**
 * User Stats Widget
 * Displays current level, XP, and key statistics
 * 
 * @param {string} userId - User ID to fetch stats for
 */
export default function StatsWidget({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          // Gracefully handle if table doesn't exist
          if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.log('Stats table not yet created or no stats record exists.');
            setStats(null);
            setLoading(false);
            return;
          }
          console.error('Error loading stats:', error);
          setLoading(false);
          return;
        }

        setStats(data);
      } catch (error) {
        console.error('Error in fetchStats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Poll for stats updates every 30 seconds (real-time disabled)
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <div className="stats-widget">
        <div className="stats-loading">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-widget">
        <div className="stats-empty">
          <p>Start working out to track your progress!</p>
        </div>
      </div>
    );
  }

  // Calculate XP progress to next level
  const xpForNextLevel = Math.pow(stats.current_level, 2) * 100;
  const currentLevelXp = Math.pow(stats.current_level - 1, 2) * 100;
  const xpInLevel = stats.total_xp - currentLevelXp;
  const xpNeededForLevel = xpForNextLevel - currentLevelXp;
  const xpProgress = (xpInLevel / xpNeededForLevel) * 100;

  return (
    <div className="stats-widget">
      {/* Level and XP Section */}
      <div className="level-section">
        <div className="level-badge">
          <Zap size={20} className="level-icon" />
          <span className="level-text">Level {stats.current_level}</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
          <div className="xp-text">
            {xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_workouts}</div>
            <div className="stat-label">Workouts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.current_workout_streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_prs}</div>
            <div className="stat-label">PRs Set</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-emoji">💪</div>
          <div className="stat-content">
            <div className="stat-value">
              {(stats.total_volume_lbs / 1000).toFixed(1)}K
            </div>
            <div className="stat-label">lbs Lifted</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        <div className="mini-stat">
          <span className="mini-stat-label">Sets:</span>
          <span className="mini-stat-value">{stats.total_sets}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Reps:</span>
          <span className="mini-stat-value">{stats.total_reps.toLocaleString()}</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-label">Mesocycles:</span>
          <span className="mini-stat-value">{stats.mesocycles_completed}</span>
        </div>
      </div>
    </div>
  );
}
