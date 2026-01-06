/**
 * @file index.ts
 * @description Supabase Edge Function for sending direct messages with email notifications
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * 
 * This Edge Function handles secure message sending with the following features:
 * 1. Authenticates users via Supabase Auth
 * 2. Saves messages to the direct_messages table
 * 3. Sends email notifications via Resend API
 * 4. Provides comprehensive error handling and logging
 * 
 * @requires Deno
 * @requires Supabase
 * @requires Resend API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from 'https://esm.sh/resend@2.0.0';

// Type definition for Supabase client to avoid explicit any type issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// =====================================================================================
// TYPES AND INTERFACES
// =====================================================================================

interface MessageRequest {
  recipient_id: string;
  content: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
}

// =====================================================================================
// ENVIRONMENT VALIDATION
// =====================================================================================

const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY'
];

function validateEnvironment(): string[] {
  const missing = REQUIRED_ENV_VARS.filter(varName => !Deno.env.get(varName));
  return missing;
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

/**
 * Create API response object
 * @param success - Whether the operation was successful
 * @param message - Success or error message
 * @param data - Optional response data
 * @param error - Optional error details
 * @returns Formatted API response
 */
function createResponse(
  success: boolean, 
  message: string, 
  data?: Record<string, unknown>, 
  error?: string
): Response {
  const response: ApiResponse = { success, message };
  if (data !== undefined) response.data = data;
  if (error) response.error = error;
  
  return new Response(
    JSON.stringify(response),
    {
      status: success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    }
  );
}

/**
 * Extract user ID from Supabase auth
 * @param supabase - Supabase client instance
 * @returns User ID or null if not authenticated
 */
async function getCurrentUserId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error);
      return null;
    }
    
    return user?.id || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Fetch user profile information
 * @param supabase - Admin Supabase client
 * @param userId - User ID to fetch profile for
 * @returns User profile or null if not found
 */
async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
  try {
    // First try to get from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();
    
    if (!profileError && profile) {
      return profile;
    }
    
    // Fallback to auth.users table
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error('Failed to fetch user profile:', profileError || userError);
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Save message to database
 * @param supabase - User-context Supabase client
 * @param senderId - ID of the message sender
 * @param recipientId - ID of the message recipient
 * @param content - Message content
 * @returns Saved message data or throws error
 */
async function saveMessage(
  supabase: SupabaseClient, 
  senderId: string, 
  recipientId: string, 
  content: string
) {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content: content.trim()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Database error saving message:', error);
    throw new Error(`Failed to save message: ${error.message}`);
  }
  
  return data;
}

/**
 * Send email notification via Resend
 * @param resend - Resend client instance
 * @param recipientEmail - Email address to send notification to
 * @param senderName - Name of the message sender
 * @param messagePreview - Preview of the message content
 * @returns Email send result
 */
async function sendEmailNotification(
  resend: Resend,
  recipientEmail: string,
  senderName: string,
  messagePreview: string
) {
  const emailData = await resend.emails.send({
    from: 'Felony Fitness <notifications@felony.fitness>',
    to: [recipientEmail],
    subject: `You have a new message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message - Felony Fitness</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .message-preview { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📱 New Message</h1>
            <p>You have received a new message on Felony Fitness</p>
          </div>
          <div class="content">
            <h2>From: ${senderName}</h2>
            <div class="message-preview">
              <p><strong>Message Preview:</strong></p>
              <p>${messagePreview.length > 150 ? messagePreview.substring(0, 150) + '...' : messagePreview}</p>
            </div>
            <p>Open the Felony Fitness app to read the full message and reply.</p>
            <a href="https://app.felony.fitness/trainer/messages" class="cta-button">Open Messages</a>
            <div class="footer">
              <p>This is an automated notification from Felony Fitness.</p>
              <p>If you no longer wish to receive these notifications, you can update your preferences in the app.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Message from ${senderName}
      
      Message Preview: ${messagePreview.length > 150 ? messagePreview.substring(0, 150) + '...' : messagePreview}
      
      Open the Felony Fitness app to read the full message and reply: https://app.felony.fitness/trainer/messages
      
      This is an automated notification from Felony Fitness.
    `
  });

  return emailData;
}

// =====================================================================================
// MAIN HANDLER
// =====================================================================================

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createResponse(false, 'Method not allowed. Use POST.', null, 'INVALID_METHOD');
  }

  try {
    console.log('🚀 Starting send-message function...');

    // ===== 1. VALIDATE ENVIRONMENT =====
    const missingEnvVars = validateEnvironment();
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      return createResponse(
        false, 
        'Server configuration error', 
        null, 
        `Missing environment variables: ${missingEnvVars.join(', ')}`
      );
    }

    // ===== 2. INITIALIZE CLIENTS =====
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    // User-context Supabase client (for auth and user-specific operations)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') ?? '',
        },
      },
    });

    // Admin Supabase client (for admin operations)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Resend client
    const resend = new Resend(resendApiKey);

    console.log('✅ Clients initialized successfully');

    // ===== 3. AUTHENTICATE USER =====
    const senderId = await getCurrentUserId(supabase);
    if (!senderId) {
      console.error('Authentication failed - no valid user ID');
      return createResponse(false, 'Authentication required', null, 'UNAUTHENTICATED');
    }

    console.log('✅ User authenticated:', senderId);

    // ===== 4. PARSE REQUEST BODY =====
    let requestBody: MessageRequest;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return createResponse(false, 'Invalid JSON in request body', null, 'INVALID_JSON');
    }

    const { recipient_id, content } = requestBody;

    // ===== 5. VALIDATE REQUEST DATA =====
    if (!recipient_id || !content) {
      console.error('Missing required fields:', { recipient_id: !!recipient_id, content: !!content });
      return createResponse(
        false, 
        'Missing required fields: recipient_id and content are required', 
        null, 
        'MISSING_FIELDS'
      );
    }

    if (recipient_id === senderId) {
      console.error('User attempting to send message to themselves');
      return createResponse(false, 'Cannot send message to yourself', null, 'INVALID_RECIPIENT');
    }

    if (content.trim().length === 0) {
      console.error('Empty message content');
      return createResponse(false, 'Message content cannot be empty', null, 'EMPTY_CONTENT');
    }

    if (content.length > 5000) { // Reasonable message length limit
      console.error('Message too long:', content.length);
      return createResponse(false, 'Message too long (maximum 5000 characters)', null, 'MESSAGE_TOO_LONG');
    }

    console.log('✅ Request data validated');

    // ===== 6. SAVE MESSAGE TO DATABASE =====
    let savedMessage;
    try {
      savedMessage = await saveMessage(supabase, senderId, recipient_id, content);
      console.log('✅ Message saved to database:', savedMessage.id);
    } catch (error) {
      console.error('Failed to save message:', error);
      return createResponse(false, 'Failed to save message', null, error.message);
    }

    // ===== 7. FETCH USER PROFILES FOR EMAIL =====
    const [senderProfile, recipientProfile] = await Promise.all([
      getUserProfile(supabaseAdmin, senderId),
      getUserProfile(supabaseAdmin, recipient_id)
    ]);

    if (!senderProfile) {
      console.error('Failed to fetch sender profile');
      // Message was saved, so we don't return an error, just log it
      console.log('⚠️ Email notification skipped - sender profile not found');
    } else if (!recipientProfile || !recipientProfile.email) {
      console.error('Failed to fetch recipient profile or email');
      console.log('⚠️ Email notification skipped - recipient profile/email not found');
    } else {
      // ===== 8. SEND EMAIL NOTIFICATION =====
      try {
        const senderName = senderProfile.full_name || senderProfile.email?.split('@')[0] || 'A trainer';
        const emailResult = await sendEmailNotification(
          resend,
          recipientProfile.email,
          senderName,
          content
        );

        if (emailResult.data) {
          console.log('✅ Email notification sent successfully:', emailResult.data.id);
        } else {
          console.error('Email notification failed:', emailResult.error);
        }
      } catch (error) {
        console.error('Failed to send email notification:', error);
        // Don't fail the entire request if email fails
        console.log('⚠️ Message saved successfully, but email notification failed');
      }
    }

    // ===== 9. RETURN SUCCESS RESPONSE =====
    return createResponse(
      true, 
      'Message sent successfully', 
      {
        message_id: savedMessage.id,
        created_at: savedMessage.created_at,
        content: savedMessage.content
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in send-message function:', error);
    return createResponse(
      false, 
      'Internal server error', 
      null, 
      error.message || 'Unknown error occurred'
    );
  }
});

console.log('📡 send-message Edge Function is ready to serve requests');