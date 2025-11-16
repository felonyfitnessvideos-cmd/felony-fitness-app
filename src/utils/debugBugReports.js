/**
 * Debug utility to check bug reporting system
 * 
 * @description This utility logs potentially sensitive user data and should ONLY be used in development.
 * It is automatically disabled in production builds.
 */
import { supabase } from './supabaseClient';

export async function debugBugReports() {
  // Prevent execution in production builds
  if (import.meta.env.PROD) {
    console.warn('debugBugReports() is disabled in production');
    return null;
  }
  
  console.log('=== BUG REPORTING DEBUG ===');
  
  // 1. Check current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current User:', user?.id, user?.email);
  
  // 2. Check user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, email, first_name, last_name, is_admin, is_beta')
    .eq('id', user?.id)
    .single();
  
  console.log('User Profile:', profile);
  console.log('Profile Error:', profileError);
  
  // 3. Check bug reports (direct query)
  const { data: reports, error: reportsError } = await supabase
    .from('bug_reports')
    .select('*');
  
  console.log('Bug Reports Count:', reports?.length);
  console.log('Bug Reports:', reports);
  console.log('Reports Error:', reportsError);
  
  // 4. Check with full join (as getAllBugReports does)
  const { data: fullReports, error: fullError } = await supabase
    .from('bug_reports')
    .select(`
      *,
      reporter:user_profiles!bug_reports_user_id_fkey(
        id,
        first_name,
        last_name,
        email,
        is_beta
      )
    `);
  
  console.log('Full Reports Count:', fullReports?.length);
  console.log('Full Reports:', fullReports);
  console.log('Full Reports Error:', fullError);
  
  console.log('=== END DEBUG ===');
  
  return {
    user: profile,
    reportsCount: reports?.length || 0,
    reports,
    reportsError,
    fullReportsCount: fullReports?.length || 0,
    fullReports,
    fullError
  };
}
