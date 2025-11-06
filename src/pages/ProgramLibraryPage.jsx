/**
 * @fileoverview Program Library Page Component
 * @description Main page component for browsing and managing workout programs.
 * Allows trainers to view available programs, see program details, and assign routines to clients.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires Supabase
 * @requires React Router
 * 
 * @component ProgramLibraryPage
 * @example
 * // Used in router configuration
 * <Route path="/program-library" element={<ProgramLibraryPage />} />
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// import { useAuth } from '../AuthContext';
import SubPageHeader from '../components/SubPageHeader';
import './ProgramLibraryPage.css';

/**
 * @typedef {Object} Program
 * @property {string} id - Unique program identifier
 * @property {string} name - Display name of the program
 * @property {string} description - Detailed description
 * @property {string} difficulty_level - beginner|intermediate|advanced
 * @property {number} estimated_weeks - Duration in weeks
 * @property {Array} target_muscle_groups - Array of muscle groups
 * @property {string} created_by - Creator user ID
 * @property {string} created_at - ISO timestamp
 * @property {Object} creator_profile - Creator's profile information
 * @property {number} routine_count - Number of routines in program
 */

/**
 * @typedef {Object} FilterState
 * @property {string} difficulty - Difficulty level filter
 * @property {string} muscleGroup - Target muscle group filter  
 * @property {string} search - Text search filter
 * @property {string} creator - Creator filter
 */

const ProgramLibraryPage = () => {
  // const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** @type {[FilterState, Function]} */
  const [filters, setFilters] = useState({
    difficulty: '',
    muscleGroup: '',
    search: '',
    creator: ''
  });

  const [creators, setCreators] = useState([]);
  const [muscleGroups] = useState([
    'Chest', 'Lats', 'Shoulders', 'Biceps', 'Quadriceps', 'Core', 'Full Body'
  ]);

  /**
   * Fetch all available programs with creator information
   * @async
   * @function fetchPrograms
   * @returns {Promise<void>}
   */
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch programs with creator profiles and routine counts
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select(`
          *,
          creator_profile:user_profiles!created_by (
            id,
            full_name,
            trainer_specialization
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      // Get routine counts for each program
      const programsWithCounts = await Promise.all(
        programsData.map(async (program) => {
          const { count } = await supabase
            .from('program_routines')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);
          
          return {
            ...program,
            routine_count: count || 0
          };
        })
      );

      setPrograms(programsWithCounts);

      // Extract unique creators for filter dropdown
      const uniqueCreators = Array.from(
        new Set(programsWithCounts.map(p => p.creator_profile?.full_name))
      ).filter(Boolean);
      setCreators(uniqueCreators);

    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters to programs list
   * @function getFilteredPrograms
   * @returns {Array<Program>} Filtered programs array
   */
  const getFilteredPrograms = () => {
    return programs.filter(program => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          program.name.toLowerCase().includes(searchTerm) ||
          program.description.toLowerCase().includes(searchTerm) ||
          program.target_muscle_groups.some(muscle => 
            muscle.toLowerCase().includes(searchTerm)
          );
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (filters.difficulty && program.difficulty_level !== filters.difficulty) {
        return false;
      }

      // Muscle group filter
      if (filters.muscleGroup && !program.target_muscle_groups.includes(filters.muscleGroup)) {
        return false;
      }

      // Creator filter
      if (filters.creator && program.creator_profile?.full_name !== filters.creator) {
        return false;
      }

      return true;
    });
  };

  /**
   * Handle filter changes
   * @function handleFilterChange
   * @param {string} filterType - Type of filter to update
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  /**
   * Clear all active filters
   * @function clearFilters
   */
  const clearFilters = () => {
    setFilters({
      difficulty: '',
      muscleGroup: '',
      search: '',
      creator: ''
    });
  };

  /**
   * Get difficulty level display with emoji
   * @function getDifficultyDisplay
   * @param {string} level - Difficulty level
   * @returns {string} Formatted difficulty display
   */
  const getDifficultyDisplay = (level) => {
    const displays = {
      beginner: '🟢 Beginner',
      intermediate: '🟡 Intermediate', 
      advanced: '🔴 Advanced'
    };
    return displays[level] || level;
  };

  /**
   * Format estimated duration
   * @function formatDuration
   * @param {number} weeks - Number of weeks
   * @returns {string} Formatted duration string
   */
  const formatDuration = (weeks) => {
    if (weeks === 1) return '1 week';
    if (weeks < 4) return `${weeks} weeks`;
    const months = Math.round(weeks / 4);
    return months === 1 ? '1 month' : `${months} months`;
  };

  // Load programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const filteredPrograms = getFilteredPrograms();
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  if (loading) {
    return (
      <div className="program-library-page">
        <SubPageHeader 
          title="Program Library" 
          subtitle="Browse and assign workout programs"
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="program-library-page">
        <SubPageHeader 
          title="Program Library" 
          subtitle="Browse and assign workout programs"
        />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchPrograms} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="program-library-page">
      <SubPageHeader 
        title="Program Library" 
        subtitle={`${programs.length} workout program${programs.length !== 1 ? 's' : ''} available`}
      />

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>📊 Filter Programs</h3>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
          )}
        </div>

        <div className="filters-grid">
          {/* Search Filter */}
          <div className="filter-group">
            <label htmlFor="search-filter">🔍 Search</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search programs, muscle groups..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="filter-group">
            <label htmlFor="difficulty-filter">💪 Difficulty</label>
            <select
              id="difficulty-filter"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="filter-select"
            >
              <option value="">All Levels</option>
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced</option>
            </select>
          </div>

          {/* Muscle Group Filter */}
          <div className="filter-group">
            <label htmlFor="muscle-filter">🎯 Target Muscles</label>
            <select
              id="muscle-filter"
              value={filters.muscleGroup}
              onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
              className="filter-select"
            >
              <option value="">All Muscle Groups</option>
              {muscleGroups.map(muscle => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </div>

          {/* Creator Filter */}
          <div className="filter-group">
            <label htmlFor="creator-filter">👨‍💼 Created By</label>
            <select
              id="creator-filter"
              value={filters.creator}
              onChange={(e) => handleFilterChange('creator', e.target.value)}
              className="filter-select"
            >
              <option value="">All Creators</option>
              {creators.map(creator => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            {filters.search && (
              <span className="filter-tag">
                Search: "{filters.search}"
                <button onClick={() => handleFilterChange('search', '')}>×</button>
              </span>
            )}
            {filters.difficulty && (
              <span className="filter-tag">
                {getDifficultyDisplay(filters.difficulty)}
                <button onClick={() => handleFilterChange('difficulty', '')}>×</button>
              </span>
            )}
            {filters.muscleGroup && (
              <span className="filter-tag">
                {filters.muscleGroup}
                <button onClick={() => handleFilterChange('muscleGroup', '')}>×</button>
              </span>
            )}
            {filters.creator && (
              <span className="filter-tag">
                By {filters.creator}
                <button onClick={() => handleFilterChange('creator', '')}>×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="results-section">
        <div className="results-header">
          <h3>
            📋 Programs ({filteredPrograms.length})
            {hasActiveFilters && filteredPrograms.length !== programs.length && (
              <span className="filter-results"> of {programs.length} total</span>
            )}
          </h3>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No programs found</h3>
            <p>
              {hasActiveFilters 
                ? "Try adjusting your filters to see more results."
                : "No programs are currently available."
              }
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="programs-grid">
            {filteredPrograms.map(program => (
              <div key={program.id} className="program-card">
                <div className="program-header">
                  <h4 className="program-name">{program.name}</h4>
                  <div className="program-difficulty">
                    {getDifficultyDisplay(program.difficulty_level)}
                  </div>
                </div>

                <p className="program-description">{program.description}</p>

                <div className="program-details">
                  <div className="detail-item">
                    <span className="detail-label">⏱️ Duration:</span>
                    <span className="detail-value">{formatDuration(program.estimated_weeks)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">🎯 Target:</span>
                    <span className="detail-value">{program.target_muscle_groups.join(', ')}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">📝 Routines:</span>
                    <span className="detail-value">{program.routine_count} workout{program.routine_count !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">👨‍💼 Created by:</span>
                    <span className="detail-value">{program.creator_profile?.full_name || 'Unknown'}</span>
                  </div>
                </div>

                <div className="program-actions">
                  <Link 
                    to={`/program-library/${program.id}`}
                    className="view-program-btn"
                  >
                    👁️ View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramLibraryPage;