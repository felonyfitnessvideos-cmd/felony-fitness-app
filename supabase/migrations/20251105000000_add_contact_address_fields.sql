-- Add contact and address fields to user_profiles table
-- Date: November 5, 2025
--
-- ⚠️ PII SECURITY NOTICE:
-- These columns contain Personally Identifiable Information (PII).
-- Security measures:
-- 1. Row-level security (RLS) policies restrict access to user's own data
-- 2. Data transmitted only over HTTPS (enforced by Supabase)
-- 3. Stored with Supabase's encryption at rest (AES-256)
-- 4. Application-level access control via RLS policies on user_profiles table
-- 5. Audit logging via Supabase audit logs (enterprise feature)
--
-- GDPR/CCPA Compliance:
-- - Users can request deletion via account settings
-- - Data retention follows company data retention policy
-- - Access logs maintained for compliance auditing

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.phone IS 'User phone number (PII - protected by RLS)';
COMMENT ON COLUMN user_profiles.address IS 'Street address (PII - protected by RLS)';
COMMENT ON COLUMN user_profiles.city IS 'City (PII - protected by RLS)';
COMMENT ON COLUMN user_profiles.state IS 'State/Province (PII - protected by RLS)';
COMMENT ON COLUMN user_profiles.zip_code IS 'ZIP/Postal code (PII - protected by RLS)';