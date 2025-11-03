/**
 * @file workoutBuilderTypes.ts
 * @description TypeScript type definitions for the Workout Builder Platform
 * @project Felony Fitness - Dynamic Workout Builder
 */

// ===============================================
// MUSCLE GROUP AND EXERCISE TYPES
// ===============================================

export interface MuscleGroup {
  id: number;
  name: string;
  description?: string;
  muscle_group_category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment_needed?: string;
  primary_muscle_group_id?: number;
  secondary_muscle_group_id?: number;
  tertiary_muscle_group_id?: number;
  primary_muscle_groups?: MuscleGroup;
  secondary_muscle_groups?: MuscleGroup;
  tertiary_muscle_groups?: MuscleGroup;
  created_at?: string;
  updated_at?: string;
}

// ===============================================
// INTERACTIVE MUSCLE MAP TYPES
// ===============================================

export interface MuscleRegion {
  id: string;
  name: string;
  path: string;
  viewBox?: string;
  isActive?: boolean;
  intensity?: number;
  onClick?: (muscleName: string) => void;
}

export interface MuscleMapProps {
  selectedMuscles?: string[];
  highlightedMuscles?: string[];
  onMuscleClick?: (muscleName: string) => void;
  showLabels?: boolean;
  interactive?: boolean;
  heatmapData?: HeatmapDataPoint[];
  className?: string;
  style?: React.CSSProperties;
}

export interface ViewState {
  currentView: 'front' | 'back';
  selectedMuscles: string[];
  highlightedMuscles: string[];
  hoverMuscle: string | null;
}

// ===============================================
// MUSCLE EXPLORER TYPES
// ===============================================

export interface MuscleExplorerProps {
  initialMuscle?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  maxResults?: number;
  onExerciseSelect?: (exercise: Exercise) => void;
  onMuscleSelect?: (muscle: string) => void;
  className?: string;
}

export interface MuscleExplorerState {
  selectedMuscle: string | null;
  selectedExercise: Exercise | null;
  exercises: Exercise[];
  filteredExercises: Exercise[];
  searchTerm: string;
  difficultyFilter: string;
  equipmentFilter: string;
  isLoading: boolean;
  error: string | null;
  viewState: ViewState;
}

export interface FilterOptions {
  difficulty: Array<'Beginner' | 'Intermediate' | 'Advanced' | 'All'>;
  equipment: string[];
  muscleGroups: string[];
}

// ===============================================
// PROGRAM ANALYTICS TYPES
// ===============================================

export interface EngagementOptions {
  primaryWeight?: number;
  secondaryWeight?: number;
  tertiaryWeight?: number;
  includeVolume?: boolean;
  volumeMultiplier?: number;
}

export interface MuscleEngagement {
  muscleName: string;
  engagementType: 'primary' | 'secondary' | 'tertiary';
}

export interface MuscleDetails {
  primaryHits: number;
  secondaryHits: number;
  tertiaryHits: number;
  totalSets: number;
  exercises: Array<{
    name: string;
    engagementType: 'primary' | 'secondary' | 'tertiary';
    sets: number;
  }>;
}

export interface SortedMuscle {
  muscle: string;
  score: number;
  percentage: number;
  rank: number;
}

export interface BalanceAnalysis {
  overall: 'balanced' | 'moderately_imbalanced' | 'imbalanced' | 'empty' | 'error';
  details: string[];
  recommendations: string[];
  muscleGroupCategories: {
    overworked: SortedMuscle[];
    balanced: SortedMuscle[];
    underworked: SortedMuscle[];
    neglected: SortedMuscle[];
  };
}

export interface ProgramStats {
  totalExercises: number;
  totalSets: number;
  totalPoints: number;
  uniqueMusclesTargeted: number;
}

export interface ExerciseBreakdown {
  exerciseName: string;
  routineIndex: number;
  exerciseIndex: number;
  sets: number;
  muscles: MuscleEngagement[];
  volumeBonus: number;
}

export interface ProgramEngagementResult {
  engagementScores: Record<string, number>;
  muscleDetails: Record<string, MuscleDetails>;
  sortedMuscles: SortedMuscle[];
  balanceAnalysis: BalanceAnalysis;
  programStats: ProgramStats;
  exerciseBreakdown: ExerciseBreakdown[];
  error?: string;
  generatedAt: string;
}

export interface HeatmapDataPoint {
  muscleName: string;
  intensity: number;
  intensityLevel: 'low' | 'medium' | 'high';
  score: number;
  percentage: number;
  rank: number;
}

// ===============================================
// PROGRAM STRUCTURE TYPES
// ===============================================

export interface RoutineExercise {
  exercise: Exercise;
  target_sets?: number;
  sets?: number;
  target_reps?: number;
  reps?: number;
  target_weight?: number;
  weight?: number;
  notes?: string;
}

export interface Routine {
  id?: number;
  name: string;
  description?: string;
  exercises?: RoutineExercise[];
  routine_exercises?: RoutineExercise[];
  created_at?: string;
  updated_at?: string;
}

export interface Program {
  id?: number;
  name: string;
  description?: string;
  routines?: Routine[];
  program_routines?: Routine[];
  duration_weeks?: number;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  created_at?: string;
  updated_at?: string;
}

// ===============================================
// UI COMPONENT TYPES
// ===============================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  details?: string;
}

export interface SearchState {
  query: string;
  results: Exercise[];
  isSearching: boolean;
  totalResults: number;
}

export interface TabState {
  activeTab: 'muscle-to-exercises' | 'exercise-to-muscles' | 'program-analysis';
  previousTab?: string;
}

// ===============================================
// EVENT HANDLER TYPES
// ===============================================

export type MuscleClickHandler = (muscleName: string) => void;
export type ExerciseSelectHandler = (exercise: Exercise) => void;
export type FilterChangeHandler = (filterType: string, value: string) => void;
export type SearchHandler = (query: string) => void;
export type ViewChangeHandler = (view: 'front' | 'back') => void;

// ===============================================
// UTILITY FUNCTION TYPES
// ===============================================

export interface AnalyticsExportOptions {
  format: 'json' | 'csv' | 'summary';
  includeDetails?: boolean;
  includeRecommendations?: boolean;
}

export type ExportResult = string | ProgramEngagementResult;

// ===============================================
// COMPONENT REF TYPES
// ===============================================

export interface MuscleMapRef {
  highlightMuscle: (muscleName: string) => void;
  clearHighlights: () => void;
  switchView: (view: 'front' | 'back') => void;
  getCurrentView: () => 'front' | 'back';
}

export interface MuscleExplorerRef {
  selectMuscle: (muscleName: string) => void;
  selectExercise: (exercise: Exercise) => void;
  clearSelection: () => void;
  performSearch: (query: string) => void;
  applyFilter: (filterType: string, value: string) => void;
  resetFilters: () => void;
}

// ===============================================
// CONSTANTS AND ENUMS
// ===============================================

export const MUSCLE_GROUPS = {
  UPPER_BODY: [
    'Chest', 'Lats', 'Rhomboids', 'Front Delts', 'Side Delts', 'Rear Delts',
    'Biceps', 'Triceps', 'Forearms', 'Upper Traps', 'Middle Traps', 'Lower Traps'
  ],
  CORE: [
    'Abs', 'Obliques', 'Lower Back'
  ],
  LOWER_BODY: [
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors'
  ]
} as const;

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export const EQUIPMENT_TYPES = [
  'Bodyweight', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar',
  'Bench', 'Cable Machine', 'Smith Machine', 'Kettlebell', 'Medicine Ball'
] as const;

export const ENGAGEMENT_WEIGHTS = {
  PRIMARY: 3,
  SECONDARY: 2,
  TERTIARY: 1
} as const;

// ===============================================
// TYPE GUARDS
// ===============================================

export const isExercise = (obj: any): obj is Exercise => {
  return obj && typeof obj === 'object' && typeof obj.id === 'number' && typeof obj.name === 'string';
};

export const isMuscleGroup = (obj: any): obj is MuscleGroup => {
  return obj && typeof obj === 'object' && typeof obj.id === 'number' && typeof obj.name === 'string';
};

export const isProgram = (obj: any): obj is Program => {
  return obj && typeof obj === 'object' && typeof obj.name === 'string' && 
         (Array.isArray(obj.routines) || Array.isArray(obj.program_routines));
};

export const isProgramEngagementResult = (obj: any): obj is ProgramEngagementResult => {
  return obj && typeof obj === 'object' && 
         obj.engagementScores && 
         obj.muscleDetails && 
         Array.isArray(obj.sortedMuscles) &&
         obj.balanceAnalysis &&
         obj.programStats;
};

// ===============================================
// DEFAULT VALUES
// ===============================================

export const DEFAULT_ENGAGEMENT_OPTIONS: EngagementOptions = {
  primaryWeight: 3,
  secondaryWeight: 2,
  tertiaryWeight: 1,
  includeVolume: true,
  volumeMultiplier: 1
};

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced'],
  equipment: ['All', ...EQUIPMENT_TYPES],
  muscleGroups: ['All', ...MUSCLE_GROUPS.UPPER_BODY, ...MUSCLE_GROUPS.CORE, ...MUSCLE_GROUPS.LOWER_BODY]
};

export const DEFAULT_VIEW_STATE: ViewState = {
  currentView: 'front',
  selectedMuscles: [],
  highlightedMuscles: [],
  hoverMuscle: null
};

// ===============================================
// UTILITY TYPES
// ===============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make certain fields required for specific use cases
export type ExerciseWithMuscles = RequiredFields<Exercise, 'primary_muscle_group_id'>;
export type ProgramWithRoutines = RequiredFields<Program, 'routines'>;
export type CompleteEngagementResult = RequiredFields<ProgramEngagementResult, 'engagementScores' | 'sortedMuscles'>;