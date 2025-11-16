/**
 * @fileoverview Bug Reporting Utilities
 * @description Comprehensive utilities for handling bug reporting and admin response functionality
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-10
 * 
 * @module bugReportingUtils
 * 
 * ARCHITECTURE OVERVIEW:
 * =====================
 * This module provides functionality for beta users to submit bug reports and
 * for admins to view all reports and respond. Key features:
 * 
 * 1. BUG REPORT SUBMISSION
 *    - Beta users can submit bug reports with categories and priorities
 *    - Automatic browser info capture (user agent, screen size, viewport)
 *    - Optional screenshot upload
 *    - Status tracking (open → in_progress → resolved/closed/wont_fix)
 * 
 * 2. ADMIN RESPONSE SYSTEM
 *    - Admins see all bug reports from all users
 *    - Thread-based replies (bug_report_replies table)
 *    - Status and priority management
 *    - Admin notes field for internal tracking
 * 
 * 3. REAL-TIME SUBSCRIPTIONS
 *    - Listens for new bug reports (INSERT on bug_reports)
 *    - Listens for new replies (INSERT on bug_report_replies)
 *    - Listens for status/priority updates (UPDATE on bug_reports)
 * 
 * 4. DATABASE SCHEMA
 *    bug_reports table:
 *      - id: UUID (PK)
 *      - user_id: UUID (FK to auth.users)
 *      - message_text: TEXT (max 5000 chars)
 *      - status: TEXT (open/in_progress/resolved/closed/wont_fix)
 *      - priority: TEXT (low/medium/high/critical)
 *      - category: TEXT (bug/feature_request/ui_ux/performance/other)
 *      - browser_info: JSONB
 *      - screenshot_url: TEXT
 *      - admin_notes: TEXT
 *      - resolved_by: UUID (FK to auth.users)
 *      - resolved_at: TIMESTAMPTZ
 *      - created_at, updated_at: TIMESTAMPTZ
 * 
 *    bug_report_replies table:
 *      - id: UUID (PK)
 *      - bug_report_id: UUID (FK to bug_reports)
 *      - user_id: UUID (FK to auth.users)
 *      - message_text: TEXT (max 2000 chars)
 *      - is_admin_reply: BOOLEAN
 *      - created_at: TIMESTAMPTZ
 * 
 * USAGE EXAMPLES:
 * ===============
 * 
 * // Get bug reports for current user (beta user)
 * const reports = await getBugReports();
 * 
 * // Get all bug reports (admin only)
 * const allReports = await getAllBugReports();
 * 
 * // Submit a new bug report
 * await submitBugReport({
 *   message: "App crashes when...",
 *   category: "bug",
 *   priority: "high"
 * });
 * 
 * // Reply to a bug report
 * await replyToBugReport(reportId, "Thanks for reporting!");
 * 
 * // Update status (admin only)
 * await updateBugReportStatus(reportId, "in_progress");
 * 
 * // Subscribe to real-time updates
 * const subscription = await subscribeToBugReports(() => {
 *   // Reload bug reports
 * });
 * 
 * @requires @supabase/supabase-js
 * @see {@link https://supabase.com/docs/guides/realtime|Supabase Realtime}
 */

import { supabase } from '../supabaseClient';

// =====================================================================================
// TYPES AND ENUMS
// =====================================================================================

/**
 * Bug report status values
 * @readonly
 * @enum {string}
 */
export const BUG_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  WONT_FIX: 'wont_fix'
};

/**
 * Bug report priority values
 * @readonly
 * @enum {string}
 */
export const BUG_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Bug report category values
 * @readonly
 * @enum {string}
 */
export const BUG_CATEGORY = {
  BUG: 'bug',
  FEATURE_REQUEST: 'feature_request',
  UI_UX: 'ui_ux',
  PERFORMANCE: 'performance',
  OTHER: 'other'
};

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

/**
 * Capture current browser information for debugging
 * 
 * @description Collects browser and device information to help debug reports.
 * Includes user agent, screen dimensions, viewport size, device pixel ratio,
 * and platform information.
 * 
 * @returns {Object} Browser information object
 * @returns {string} return.userAgent - Navigator user agent string
 * @returns {Object} return.screen - Screen dimensions
 * @returns {number} return.screen.width - Screen width in pixels
 * @returns {number} return.screen.height - Screen height in pixels
 * @returns {Object} return.viewport - Viewport dimensions
 * @returns {number} return.viewport.width - Viewport width in pixels
 * @returns {number} return.viewport.height - Viewport height in pixels
 * @returns {number} return.devicePixelRatio - Device pixel ratio
 * @returns {string} return.platform - Operating system platform
 * @returns {string} return.language - Browser language
 * @returns {string} return.timestamp - ISO timestamp of capture
 * 
 * @example
 * const browserInfo = captureBrowserInfo();
 * // Returns: {
 * //   userAgent: "Mozilla/5.0...",
 * //   screen: { width: 1920, height: 1080 },
 * //   viewport: { width: 1280, height: 720 },
 * //   devicePixelRatio: 2,
 * //   platform: "Win32",
 * //   language: "en-US",
 * //   timestamp: "2025-11-10T..."
 * // }
 */
function captureBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    devicePixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate bug report message text
 * 
 * @description Ensures message meets length requirements (1-5000 characters).
 * Throws error if validation fails.
 * 
 * @param {string} message - Message to validate
 * @throws {Error} If message is empty or exceeds 5000 characters
 * 
 * @example
 * validateBugReportMessage("App crashes when..."); // passes
 * validateBugReportMessage(""); // throws error
 * validateBugReportMessage("x".repeat(5001)); // throws error
 */
function validateBugReportMessage(message) {
  if (!message || message.trim().length === 0) {
    throw new Error('Bug report message cannot be empty');
  }
  if (message.length > 5000) {
    throw new Error('Bug report message cannot exceed 5000 characters');
  }
}

/**
 * Validate reply message text
 * 
 * @description Ensures reply meets length requirements (1-2000 characters).
 * Throws error if validation fails.
 * 
 * @param {string} message - Reply message to validate
 * @throws {Error} If message is empty or exceeds 2000 characters
 * 
 * @example
 * validateReplyMessage("Thanks for reporting!"); // passes
 * validateReplyMessage(""); // throws error
 * validateReplyMessage("x".repeat(2001)); // throws error
 */
function validateReplyMessage(message) {
  if (!message || message.trim().length === 0) {
    throw new Error('Reply message cannot be empty');
  }
  if (message.length > 2000) {
    throw new Error('Reply message cannot exceed 2000 characters');
  }
}

// =====================================================================================
// BUG REPORT QUERIES
// =====================================================================================

/**
 * Get bug reports for current user
 * 
 * @description Fetches all bug reports submitted by the current user with their replies.
 * Includes reporter information and reply count. Orders by most recent first.
 * 
 * @returns {Promise<Array>} Array of bug report objects with nested replies
 * @throws {Error} If user is not authenticated or query fails
 * 
 * @example
 * const myReports = await getBugReports();
 * console.log(`You have ${myReports.length} bug reports`);
 */
export async function getBugReports() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's bug reports
    const { data: reports, error: reportsError } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (reportsError) throw reportsError;
    if (!reports || reports.length === 0) return [];

    // Get report IDs for fetching replies
    const reportIds = reports.map(r => r.id);

    // Fetch all replies for these reports
    const { data: replies, error: repliesError } = await supabase
      .from('bug_report_replies')
      .select(`
        id,
        bug_report_id,
        message_text,
        is_admin_reply,
        created_at,
        user_id
      `)
      .in('bug_report_id', reportIds);

    if (repliesError) throw repliesError;

    // Get reply user IDs
    const replyUserIds = [...new Set(replies?.map(r => r.user_id).filter(Boolean) || [])];

    // Fetch reply user profiles
    const { data: replyProfiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, is_admin')
      .in('id', replyUserIds);

    // Create map of reply profiles
    const replyProfilesMap = {};
    replyProfiles?.forEach(p => {
      replyProfilesMap[p.id] = p;
    });

    // Group replies by bug report ID
    const repliesByReport = {};
    replies?.forEach(reply => {
      if (!repliesByReport[reply.bug_report_id]) {
        repliesByReport[reply.bug_report_id] = [];
      }
      repliesByReport[reply.bug_report_id].push({
        ...reply,
        user: replyProfilesMap[reply.user_id] || null
      });
    });

    // Combine everything
    const enrichedReports = reports.map(report => ({
      ...report,
      replies: repliesByReport[report.id] || []
    }));

    return enrichedReports;
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    throw error;
  }
}

/**
 * Get all bug reports (admin only)
 * 
 * @description Fetches ALL bug reports from all users. Should only be called
 * for admin users. Includes full reporter information and reply threads.
 * Orders by priority (critical first) then by date.
 * 
 * @returns {Promise<Array>} Array of all bug report objects with nested data
 * @throws {Error} If query fails or user lacks permissions
 * 
 * @example
 * // In admin component
 * const allReports = await getAllBugReports();
 * const openReports = allReports.filter(r => r.status === 'open');
 */
export async function getAllBugReports() {
  try {
    // Get all bug reports
    const { data: reports, error: reportsError } = await supabase
      .from('bug_reports')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (reportsError) throw reportsError;
    if (!reports || reports.length === 0) return [];

    // Get user IDs from reports
    const userIds = [...new Set(reports.map(r => r.user_id).filter(Boolean))];

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, is_beta')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map of user profiles
    const profilesMap = {};
    profiles?.forEach(p => {
      profilesMap[p.id] = p;
    });

    // Get all report IDs for fetching replies
    const reportIds = reports.map(r => r.id);

    // Fetch all replies
    const { data: replies, error: repliesError } = await supabase
      .from('bug_report_replies')
      .select(`
        id,
        bug_report_id,
        message_text,
        is_admin_reply,
        created_at,
        user_id
      `)
      .in('bug_report_id', reportIds);

    if (repliesError) throw repliesError;

    // Get reply user IDs
    const replyUserIds = [...new Set(replies?.map(r => r.user_id).filter(Boolean) || [])];

    // Fetch reply user profiles
    const { data: replyProfiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, is_admin')
      .in('id', replyUserIds);

    // Create map of reply profiles
    const replyProfilesMap = {};
    replyProfiles?.forEach(p => {
      replyProfilesMap[p.id] = p;
    });

    // Group replies by bug report ID
    const repliesByReport = {};
    replies?.forEach(reply => {
      if (!repliesByReport[reply.bug_report_id]) {
        repliesByReport[reply.bug_report_id] = [];
      }
      repliesByReport[reply.bug_report_id].push({
        ...reply,
        user: replyProfilesMap[reply.user_id] || null
      });
    });

    // Combine everything
    const enrichedReports = reports.map(report => ({
      ...report,
      reporter: profilesMap[report.user_id] || null,
      replies: repliesByReport[report.id] || []
    }));

    return enrichedReports;
  } catch (error) {
    console.error('Error fetching all bug reports:', error);
    throw error;
  }
}

/**
 * Get replies for a specific bug report
 * 
 * @description Fetches all replies for a given bug report ID, ordered chronologically.
 * Includes full user information for each reply author.
 * 
 * @param {string} bugReportId - UUID of the bug report
 * @returns {Promise<Array>} Array of reply objects with user data
 * @throws {Error} If bug report ID is invalid or query fails
 * 
 * @example
 * const replies = await getBugReportReplies(reportId);
 * replies.forEach(reply => {
 *   console.log(`${reply.user.first_name}: ${reply.message_text}`);
 * });
 */
export async function getBugReportReplies(bugReportId) {
  try {
    if (!bugReportId) {
      throw new Error('Bug report ID is required');
    }

    const { data, error } = await supabase
      .from('bug_report_replies')
      .select(`
        *,
        user:user_profiles(
          id,
          first_name,
          last_name,
          email,
          is_admin
        )
      `)
      .eq('bug_report_id', bugReportId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching bug report replies:', error);
    throw error;
  }
}

/**
 * Get unread bug report count for current user
 * 
 * @description Counts bug reports where current user is the reporter and there are
 * new admin replies since they last viewed. Used for badge notifications.
 * 
 * @returns {Promise<number>} Count of bug reports with unread admin replies
 * @throws {Error} If user is not authenticated or query fails
 * 
 * @example
 * const unreadCount = await getUnreadBugReportCount();
 * setBadgeCount(unreadCount);
 */
export async function getUnreadBugReportCount() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return 0;
    }

    // Get reports where user is reporter and there are admin replies they haven't seen
    const { error } = await supabase
      .from('bug_reports')
      .select('id, updated_at')
      .eq('user_id', user.id)
      .gt('updated_at', 'last_viewed_at'); // Assumes we track last_viewed_at

    if (error) throw error;

    // For now, return count of all open/in_progress reports
    // TODO: Implement proper last_viewed_at tracking
    const { count, error: countError } = await supabase
      .from('bug_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress']);

    if (countError) throw countError;

    return count || 0;
  } catch (error) {
    console.error('Error getting unread bug report count:', error);
    return 0;
  }
}

// =====================================================================================
// BUG REPORT MUTATIONS
// =====================================================================================

/**
 * Submit a new bug report
 * 
 * @description Creates a new bug report with automatic browser info capture.
 * Available to beta users only (enforced by RLS policies).
 * 
 * @param {Object} reportData - Bug report details
 * @param {string} reportData.message - Bug description (1-5000 characters, required)
 * @param {string} [reportData.category='bug'] - Bug category (bug/feature_request/ui_ux/performance/other)
 * @param {string} [reportData.priority='medium'] - Priority level (low/medium/high/critical)
 * @param {string} [reportData.screenshotUrl] - Optional screenshot URL from storage
 * 
 * @returns {Promise<Object>} Created bug report object
 * @throws {Error} If validation fails, user not authenticated, or database error
 * 
 * @example
 * const report = await submitBugReport({
 *   message: "App crashes when I try to log a workout",
 *   category: "bug",
 *   priority: "high"
 * });
 * console.log(`Bug report #${report.id} created`);
 */
export async function submitBugReport({ message, category = 'bug', priority = 'medium', screenshotUrl = null }) {
  try {
    // Validate message
    validateBugReportMessage(message);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Capture browser info
    const browserInfo = captureBrowserInfo();

    // Insert bug report
    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        user_id: user.id,
        message_text: message.trim(),
        status: BUG_STATUS.OPEN,
        priority: priority,
        category: category,
        browser_info: browserInfo,
        screenshot_url: screenshotUrl
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Bug report submitted successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error submitting bug report:', error);
    throw error;
  }
}

/**
 * Reply to a bug report
 * 
 * @description Adds a reply to an existing bug report. Automatically sets
 * is_admin_reply based on user's admin status. Updates the parent bug report's
 * updated_at timestamp via trigger.
 * 
 * @param {string} bugReportId - UUID of the bug report to reply to
 * @param {string} message - Reply message (1-2000 characters)
 * 
 * @returns {Promise<Object>} Created reply object
 * @throws {Error} If validation fails, report not found, or database error
 * 
 * @example
 * // Beta user replying
 * await replyToBugReport(reportId, "Here's more info about the crash...");
 * 
 * // Admin replying
 * await replyToBugReport(reportId, "Thanks! We've identified the issue.");
 */
export async function replyToBugReport(bugReportId, message) {
  try {
    // Validate inputs
    if (!bugReportId) {
      throw new Error('Bug report ID is required');
    }
    validateReplyMessage(message);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Insert reply
    const { data, error } = await supabase
      .from('bug_report_replies')
      .insert({
        bug_report_id: bugReportId,
        user_id: user.id,
        message_text: message.trim(),
        is_admin_reply: profile.is_admin || false
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Bug report reply added:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error replying to bug report:', error);
    throw error;
  }
}

/**
 * Update bug report status (admin only)
 * 
 * @description Changes the status of a bug report. Only admins can update status.
 * If status is set to resolved/closed/wont_fix, automatically sets resolved_by
 * and resolved_at timestamp.
 * 
 * @param {string} bugReportId - UUID of the bug report to update
 * @param {string} newStatus - New status (open/in_progress/resolved/closed/wont_fix)
 * 
 * @returns {Promise<Object>} Updated bug report object
 * @throws {Error} If user is not admin, invalid status, or database error
 * 
 * @example
 * // Mark as in progress
 * await updateBugReportStatus(reportId, 'in_progress');
 * 
 * // Mark as resolved
 * await updateBugReportStatus(reportId, 'resolved');
 */
export async function updateBugReportStatus(bugReportId, newStatus) {
  try {
    if (!bugReportId) {
      throw new Error('Bug report ID is required');
    }

    if (!Object.values(BUG_STATUS).includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Prepare update data
    const updateData = {
      status: newStatus
    };

    // If resolving, set resolved_by and resolved_at
    if ([BUG_STATUS.RESOLVED, BUG_STATUS.CLOSED, BUG_STATUS.WONT_FIX].includes(newStatus)) {
      updateData.resolved_by = user.id;
      updateData.resolved_at = new Date().toISOString();
    }

    // Update status
    const { data, error } = await supabase
      .from('bug_reports')
      .update(updateData)
      .eq('id', bugReportId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Bug report status updated to ${newStatus}:`, data.id);
    return data;
  } catch (error) {
    console.error('❌ Error updating bug report status:', error);
    throw error;
  }
}

/**
 * Update bug report priority (admin only)
 * 
 * @description Changes the priority level of a bug report. Only admins can
 * update priority. Used to escalate or de-escalate issues.
 * 
 * @param {string} bugReportId - UUID of the bug report to update
 * @param {string} newPriority - New priority (low/medium/high/critical)
 * 
 * @returns {Promise<Object>} Updated bug report object
 * @throws {Error} If user is not admin, invalid priority, or database error
 * 
 * @example
 * // Escalate to critical
 * await updateBugReportPriority(reportId, 'critical');
 */
export async function updateBugReportPriority(bugReportId, newPriority) {
  try {
    if (!bugReportId) {
      throw new Error('Bug report ID is required');
    }

    if (!Object.values(BUG_PRIORITY).includes(newPriority)) {
      throw new Error(`Invalid priority: ${newPriority}`);
    }

    // Update priority
    const { data, error } = await supabase
      .from('bug_reports')
      .update({ priority: newPriority })
      .eq('id', bugReportId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Bug report priority updated to ${newPriority}:`, data.id);
    return data;
  } catch (error) {
    console.error('❌ Error updating bug report priority:', error);
    throw error;
  }
}

/**
 * Add admin notes to bug report (admin only)
 * 
 * @description Adds or updates internal admin notes on a bug report.
 * Notes are not visible to the reporter, only to admins.
 * 
 * @param {string} bugReportId - UUID of the bug report
 * @param {string} notes - Admin notes (internal use only)
 * 
 * @returns {Promise<Object>} Updated bug report object
 * @throws {Error} If user is not admin or database error
 * 
 * @example
 * await addAdminNotes(reportId, "Fixed in v2.5.0 - deploy on Friday");
 */
export async function addAdminNotes(bugReportId, notes) {
  try {
    if (!bugReportId) {
      throw new Error('Bug report ID is required');
    }

    // Update admin notes
    const { data, error } = await supabase
      .from('bug_reports')
      .update({ admin_notes: notes.trim() })
      .eq('id', bugReportId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Admin notes added to bug report:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error adding admin notes:', error);
    throw error;
  }
}

// =====================================================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================================================

/**
 * Subscribe to bug report updates
 * 
 * @description Sets up real-time subscription to bug_reports table for INSERT and UPDATE events.
 * Calls the provided callback whenever a new report is created or existing report is updated.
 * 
 * @param {Function} callback - Function to call when bug reports change
 * 
 * @returns {Promise<Object>} Subscription object with unsubscribe method
 * 
 * @example
 * const subscription = await subscribeToBugReports(() => {
 *   console.log('Bug reports updated, reloading...');
 *   loadBugReports();
 * });
 * 
 * // Later, clean up
 * subscription.unsubscribe();
 */
export async function subscribeToBugReports(callback) {
  try {
    const subscription = supabase
      .channel('bug_reports_channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'bug_reports'
        },
        (payload) => {
          console.log('📡 Bug report update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    console.log('📡 Subscribed to bug reports updates');
    return subscription;
  } catch (error) {
    console.error('❌ Error subscribing to bug reports:', error);
    throw error;
  }
}

/**
 * Subscribe to bug report replies
 * 
 * @description Sets up real-time subscription to bug_report_replies table.
 * Useful for live updates in conversation threads.
 * 
 * @param {string} bugReportId - Optional: Only listen to replies for specific report
 * @param {Function} callback - Function to call when new replies arrive
 * 
 * @returns {Promise<Object>} Subscription object with unsubscribe method
 * 
 * @example
 * const subscription = await subscribeToBugReportReplies(reportId, () => {
 *   console.log('New reply received');
 *   loadReplies();
 * });
 */
export async function subscribeToBugReportReplies(bugReportId, callback) {
  try {
    let channel = supabase
      .channel('bug_report_replies_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bug_report_replies',
          ...(bugReportId && { filter: `bug_report_id=eq.${bugReportId}` })
        },
        (payload) => {
          console.log('📡 Bug report reply received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    console.log('📡 Subscribed to bug report replies');
    return channel;
  } catch (error) {
    console.error('❌ Error subscribing to bug report replies:', error);
    throw error;
  }
}

// =====================================================================================
// ERROR HANDLING
// =====================================================================================

/**
 * Handle bug reporting errors with user-friendly messages
 * 
 * @description Converts technical error messages into user-friendly error strings.
 * Useful for displaying errors in UI components.
 * 
 * @param {Error} error - The error object to handle
 * @returns {string} User-friendly error message
 * 
 * @example
 * try {
 *   await submitBugReport(data);
 * } catch (error) {
 *   const userMessage = handleBugReportError(error);
 *   alert(userMessage);
 * }
 */
export function handleBugReportError(error) {
  console.error('Bug reporting error:', error);

  if (error.message.includes('not authenticated')) {
    return 'You must be logged in to submit bug reports.';
  }

  if (error.message.includes('exceed')) {
    return error.message; // Already user-friendly
  }

  if (error.message.includes('RLS')) {
    return 'You do not have permission to perform this action.';
  }

  if (error.code === '23503') {
    return 'Bug report not found or has been deleted.';
  }

  if (error.code === '23505') {
    return 'This bug report already exists.';
  }

  // Network errors
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Default message
  return 'An unexpected error occurred. Please try again.';
}

console.log('📡 Bug reporting utilities loaded successfully');
