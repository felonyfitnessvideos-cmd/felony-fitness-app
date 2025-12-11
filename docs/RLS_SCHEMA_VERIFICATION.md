# RLS Schema Verification Results

**Date**: 2025-01-XX
**Status**: ✅ Complete - All table and column names verified against schema.sql

---

## Schema Corrections Made

### 1. **direct_messages** Table

- ❌ **Incorrect**: `receiver_id`
- ✅ **Correct**: `recipient_id`
- **Location**: Line 182 in rls-policies.sql
- **Verified Against**: schema.sql line 4720

### 2. **trainer_clients** Table

- ❌ **Incorrect**: Table name `trainer_client_relationships`
- ✅ **Correct**: Table name `trainer_clients`
- ❌ **Incorrect**: Column `client_user_id`
- ✅ **Correct**: Column `client_id`
- **Verified Against**: schema.sql line 5632

### 3. **user_profiles** Table

- ❌ **Incorrect**: Column `role` (VARCHAR/ENUM)
- ✅ **Correct**: Columns `is_admin` (BOOLEAN), `is_trainer` (BOOLEAN)
- **Verified Against**: schema.sql user_profiles table definition

---

## Tables Removed (Do Not Exist)

### 1. **workouts** Table

- **Status**: Does not exist in schema
- **Action**: Removed all RLS policies (~35 lines)
- **Note**: User workout data may be stored differently (needs investigation if workout features exist)

### 2. **program_weeks** Table

- **Status**: Does not exist in schema
- **Action**: Removed all RLS policies (~17 lines)
- **Note**: Programs store weeks/exercises in JSONB format within `programs` table

### 3. **program_exercises** Table

- **Status**: Does not exist in schema
- **Action**: Removed all RLS policies (~17 lines)
- **Note**: Exercises stored in `programs.exercise_pool` JSONB column

---

## Tables Verified & Confirmed Correct

| Table                      | Key Columns                          | RLS Policies |
| -------------------------- | ------------------------------------ | ------------ |
| `user_profiles`            | `id`, `is_admin`, `is_trainer`       | ✅           |
| `nutrition_logs`           | `user_id`, `food_id`                 | ✅           |
| `trainer_clients`          | `trainer_id`, `client_id`, `status`  | ✅           |
| `direct_messages`          | `sender_id`, `recipient_id`          | ✅           |
| `user_meals`               | `user_id`                            | ✅           |
| `weekly_meal_plans`        | `user_id`                            | ✅           |
| `weekly_meal_plan_entries` | `plan_id`, `meal_id`, `user_meal_id` | ✅           |
| `bug_reports`              | `user_id`                            | ✅           |
| `bug_report_replies`       | `bug_report_id`, `user_id`           | ✅           |
| `foods`                    | (public read)                        | ✅           |
| `portions`                 | (public read)                        | ✅           |
| `exercises`                | (public read)                        | ✅           |
| `programs`                 | `trainer_id`, `created_by`           | ✅           |
| `meals`                    | (public read)                        | ✅           |
| `meal_foods`               | `meal_id`                            | ✅           |

---

## Verification Method

Used PowerShell `Select-String` to search schema.sql for exact table structures:

```powershell
Select-String -Path schema.sql -Pattern "^CREATE TABLE public\.direct_messages" -Context 0,20
```

This was more reliable than grep + read_file due to line number alignment issues.

---

## Key Schema Findings

### `programs` Table Structure

- Stores exercises in **JSONB** format (`exercise_pool` column)
- No separate `program_weeks` or `program_exercises` tables
- Uses `trainer_id` for trainer-created programs
- Uses `created_by` for user-created programs

### `trainer_clients` Table Structure

```sql
CREATE TABLE public.trainer_clients (
    id uuid,
    trainer_id uuid,
    client_id uuid,  -- NOT client_user_id
    status varchar(20),  -- 'active', 'inactive', 'pending', 'blocked'
    notes text,
    created_at timestamp,
    updated_at timestamp,
    full_name text,
    assigned_program_id uuid,
    generated_routine_ids uuid[],
    email text,
    program_name text,
    tags text[],
    is_unsubscribed boolean
);
```

### `direct_messages` Table Structure

```sql
CREATE TABLE public.direct_messages (
    id uuid,
    sender_id uuid,
    recipient_id uuid,  -- NOT receiver_id
    content text NOT NULL,
    message_type varchar(20),
    read_at timestamp,
    created_at timestamp,
    updated_at timestamp,
    needs_response boolean
);
```

---

## RLS Migration Status

**File**: `supabase/migrations/rls-policies.sql`
**Lines**: 498 (after corrections)
**Status**: ✅ Ready for execution

### What the Migration Does:

1. **Creates 3 helper functions** (SECURITY DEFINER):
   - `is_admin()` - checks `user_profiles.is_admin = true`
   - `is_trainer()` - checks `user_profiles.is_trainer = true`
   - `is_trainer_for_client(client_id)` - checks active trainer-client relationship

2. **Enables RLS** on 15 tables

3. **Creates ~50 policies** covering:
   - User access (own data only)
   - Trainer access (own + active clients' data)
   - Admin access (everything)
   - Public read (foods, exercises, programs, etc.)

---

## Next Steps

1. ✅ Execute migration in Supabase SQL Editor
2. ⏳ Test user authentication flows
3. ⏳ Verify trainers can access client data
4. ⏳ Verify admins have full access
5. ⏳ Monitor Supabase logs for RLS policy violations

---

## Notes for Future Development

- If workout tracking features are added, create `workouts` table and RLS policies
- Consider creating `program_weeks` / `program_exercises` tables if JSONB becomes unwieldy
- Direct messages use `recipient_id` - ensure frontend uses this column name
- Trainer relationship status must be `'active'` for trainer access to work
