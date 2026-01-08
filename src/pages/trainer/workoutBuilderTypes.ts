/**
 * Program statistics interface
 */
export interface ProgramStats {
  total_workouts: number;
  completed_workouts: number;
  total_exercises: number;
  completion_rate: number;
}

export const isProgramStats = (obj: unknown): obj is ProgramStats => {
  if (!obj || typeof obj !== 'object') return false;
  
  const stats = obj as Record<string, unknown>;
  return (
    typeof stats.total_workouts === 'number' &&
    typeof stats.completed_workouts === 'number' &&
    typeof stats.total_exercises === 'number' &&
    typeof stats.completion_rate === 'number'
  );
};