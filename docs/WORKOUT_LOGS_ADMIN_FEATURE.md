# Workout Logs Admin Feature

## Overview

Added a new "Workout Logs" tab to the TrainerAdminPanel that allows trainers to manually add past/historical workout logs from handwritten records.

## Location

- **Component**: `src/pages/trainer/TrainerAdminPanel.tsx`
- **Styling**: `src/pages/trainer/TrainerAdminPanel.css`

## Feature Details

### Tab: Workout Logs

The new fourth tab allows trainers to enter workout log data with the following fields:

#### Required Fields

- **User** (dropdown) - Select which user the workout belongs to
- **Workout Date** (date picker) - Date the workout occurred

#### Optional Fields

- **Routine** (dropdown) - Associate the workout with a specific routine
- **Workout Name** (text input) - Custom name for the workout session
- **Start Time** (time input) - When the workout started
- **End Time** (time input) - When the workout ended
- **Duration** (number input, minutes) - Total duration of the workout
- **Total Volume** (number input, kg) - Total weight lifted
- **Total Reps** (number input) - Total repetitions performed
- **Calories Burned** (number input) - Estimated calories burned
- **Mood Rating** (dropdown, 1-5) - How the user felt during the workout
- **Notes** (textarea) - Additional notes about the session
- **Completed** (checkbox) - Whether the workout was completed

### Data Model

```typescript
interface WorkoutLog {
  user_id?: string; // Required in submission
  routine_id?: string; // Optional
  workout_name?: string;
  log_date: string; // Required (YYYY-MM-DD format)
  started_at?: string; // Optional (HH:mm format)
  ended_at?: string; // Optional (HH:mm format)
  duration_minutes?: number; // Default: 60
  total_volume_kg?: number; // Default: 0
  total_reps?: number; // Default: 0
  calories_burned?: number; // Default: 0
  is_complete?: boolean; // Default: true
  notes?: string;
  mood_rating?: number; // Range: 1-5, Default: 3
}
```

## Implementation Details

### State Management

```typescript
// Users dropdown population
const [users, setUsers] = useState<
  Array<{ id: string; email: string; first_name?: string; last_name?: string }>
>([]);

// Routines dropdown population
const [workoutRoutines, setWorkoutRoutines] = useState<
  Array<{ id: string; routine_name: string }>
>([]);

// Form state
const [workoutLogForm, setWorkoutLogForm] = useState<WorkoutLog>({
  user_id: "",
  routine_id: "",
  workout_name: "",
  log_date: new Date().toISOString().split("T")[0],
  started_at: "",
  ended_at: "",
  duration_minutes: 60,
  total_volume_kg: 0,
  total_reps: 0,
  calories_burned: 0,
  is_complete: true,
  notes: "",
  mood_rating: 3,
});
```

### Data Fetching

When the "Workout Logs" tab is activated:

- Fetches all users from `user_profiles` table (sorted by email)
- Fetches all routines from `workout_routines` table (sorted by name)
- Populates dropdowns for trainer selection

```typescript
useEffect(() => {
  const fetchUsersAndRoutines = async () => {
    try {
      const { data: usersData } = await supabase
        .from("user_profiles")
        .select("id, email, first_name, last_name")
        .order("email");

      const { data: routinesData } = await supabase
        .from("workout_routines")
        .select("id, routine_name")
        .order("routine_name");

      setUsers(usersData || []);
      setWorkoutRoutines(routinesData || []);
    } catch (err) {
      console.error("Error fetching users/routines:", err);
    }
  };

  if (activeTab === "workoutlogs") {
    fetchUsersAndRoutines();
  }
}, [activeTab]);
```

### Form Submission

```typescript
const handleWorkoutLogSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccessMessage(null);

  try {
    if (!workoutLogForm.user_id) {
      setError("Please select a user");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("workout_logs")
      .insert([{ ...workoutLogForm, user_id: workoutLogForm.user_id }]);

    if (insertError) throw insertError;

    setSuccessMessage("Workout log created successfully!");
    // Reset form to defaults
    setWorkoutLogForm({
      user_id: "",
      routine_id: "",
      workout_name: "",
      log_date: new Date().toISOString().split("T")[0],
      started_at: "",
      ended_at: "",
      duration_minutes: 60,
      total_volume_kg: 0,
      total_reps: 0,
      calories_burned: 0,
      is_complete: true,
      notes: "",
      mood_rating: 3,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    setError(`Failed to create workout log: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};
```

## Usage Workflow

1. Navigate to Trainer Dashboard → Admin Panel
2. Click the "Workout Logs" tab
3. Select a user from the dropdown
4. Enter the date of the workout
5. (Optional) Associate with a routine if applicable
6. Fill in any optional fields (duration, volume, reps, mood, notes, etc.)
7. Click "Create Workout Log"
8. On success, form resets and success message displays
9. Repeat for next workout log entry

## Database Integration

### Target Table: `workout_logs`

```sql
CREATE TABLE public.workout_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  routine_id uuid REFERENCES workout_routines(id) ON DELETE SET NULL,
  workout_name text,
  log_date date NOT NULL,
  started_at time without time zone,
  ended_at time without time zone,
  duration_minutes integer,
  total_volume_kg numeric(10,2),
  total_reps integer,
  calories_burned integer,
  is_complete boolean DEFAULT true,
  notes text,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  cycle_session_id uuid REFERENCES cycle_sessions(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

## Access Control

- Only users with `is_admin = true` in `user_profiles` can access the admin panel
- The workout logs feature is part of the admin panel, so same restrictions apply

## UI/UX Features

- Tab-based navigation with "Workout Logs" as fourth tab
- Loading state while creating log ("Creating..." button text)
- Success/error messages with clear feedback
- Form auto-reset after successful submission
- Default date set to today when opening tab
- Dropdown selection for users and routines for data consistency
- Mood rating as readable dropdown (1-5 scale with descriptions)
- Optional fields have sensible defaults

## Future Enhancements

- Add ability to edit existing workout logs
- Add bulk import from CSV for multiple logs
- Add workout log entries (individual sets) entry capability
- Add analytics view of entered logs
- Add duplicate detection to prevent accidental duplicates

## Testing Recommendations

1. Test creating a workout log with required fields only
2. Test creating a workout log with all fields filled
3. Test selecting different users and routines
4. Test date/time inputs with various formats
5. Test form reset after submission
6. Verify data persists in database (check `workout_logs` table)
7. Test error handling (submit without selecting user)
8. Test on mobile responsive breakpoints
