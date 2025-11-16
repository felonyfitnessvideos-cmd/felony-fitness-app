/**
 * @file index.ts
 * @description Supabase Edge Function for sending bulk email campaigns to trainer's client groups
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @date 2025-11-16
 * 
 * This Edge Function handles trainer email campaigns with the following features:
 * 1. Authenticates trainer via Supabase Auth
 * 2. Queries clients by tag from trainer_clients.tags array
 * 3. Sends bulk emails via Resend API
 * 4. Returns success status with recipient count
 * 
 * @requires Deno
 * @requires Supabase
 * @requires Resend API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from 'https://esm.sh/resend@2.0.0';

// =====================================================================================
// TYPES AND INTERFACES
// =====================================================================================

interface CampaignRequest {
  tag_id: string;
  subject: string;
  body: string;
}

interface ClientRecipient {
  email: string;
  name: string;
}

// =====================================================================================
// CORS HEADERS
// =====================================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

/**
 * Create standardized response
 */
function createResponse(
  success: boolean,
  message: string,
  data: any = null,
  error: string | null = null,
  status?: number
) {
  return new Response(
    JSON.stringify({
      success,
      message,
      data,
      error,
      timestamp: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status || (success ? 200 : 400),
    }
  );
}

/**
 * Validate environment variables
 */
function validateEnvironment(): string[] {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY'
  ];
  
  return required.filter(varName => !Deno.env.get(varName));
}

/**
 * Fetch clients with specific tag
 */
async function getClientsByTag(
  supabase: any,
  trainerId: string,
  tagId: string
): Promise<ClientRecipient[]> {
  try {
    console.log(`Fetching clients with tag: ${tagId} for trainer: ${trainerId}`);
    
    // Query trainer_clients where tag_id is in tags array
    // Exclude unsubscribed clients from marketing emails
    const { data: clients, error } = await supabase
      .from('trainer_clients')
      .select('email, full_name, is_unsubscribed')
      .eq('trainer_id', trainerId)
      .eq('status', 'active')
      .eq('is_unsubscribed', false) // Only send to subscribed clients
      .contains('tags', [tagId]); // PostgreSQL array contains operator
    
    if (error) {
      console.error('Error fetching clients:', error);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }
    
    if (!clients || clients.length === 0) {
      console.log('No clients found with this tag');
      return [];
    }
    
    // Filter out clients without email and format for Resend
    const recipients = clients
      .filter((client: any) => client.email && client.email.trim() !== '')
      .map((client: any) => ({
        email: client.email,
        name: client.full_name || client.email.split('@')[0] || 'Client'
      }));
    
    console.log(`Found ${recipients.length} clients with valid emails`);
    return recipients;
    
  } catch (error) {
    console.error('Error in getClientsByTag:', error);
    throw error;
  }
}

/**
 * Personalize email body with recipient name
 */
function personalizeEmail(htmlBody: string, recipientName: string): string {
  let personalizedBody = htmlBody;
  
  // Replace common name placeholders (case insensitive)
  personalizedBody = personalizedBody.replace(/\[Recipients?\s*Name\]/gi, recipientName);
  personalizedBody = personalizedBody.replace(/\[Recipient['']?s?\s*Name\]/gi, recipientName); // Handles [Recipient's Name]
  personalizedBody = personalizedBody.replace(/\[Name\]/gi, recipientName);
  personalizedBody = personalizedBody.replace(/\[First\s*Name\]/gi, recipientName);
  personalizedBody = personalizedBody.replace(/\{\{name\}\}/gi, recipientName);
  personalizedBody = personalizedBody.replace(/\{\{recipient_name\}\}/gi, recipientName);
  
  return personalizedBody;
}

/**
 * Add unsubscribe link to email HTML
 */
function addUnsubscribeLink(htmlBody: string, recipientEmail: string): string {
  // Use Supabase Edge Function for trainer email unsubscribe
  const unsubscribeUrl = `https://www.felony.fitness/unsubscribe-trainer?email=${encodeURIComponent(recipientEmail)}`;
  
  const unsubscribeFooter = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center;">
      <p>You're receiving this email because you are a client of a trainer using Felony Fitness.</p>
      <p>
        <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">
          Unsubscribe from trainer marketing emails
        </a>
      </p>
    </div>
  `;
  
  // Insert before closing body tag, or append if no body tag
  if (htmlBody.includes('</body>')) {
    return htmlBody.replace('</body>', `${unsubscribeFooter}</body>`);
  } else {
    return htmlBody + unsubscribeFooter;
  }
}

/**
 * Send bulk email via Resend
 * 
 * @description Sends personalized emails to all recipients in parallel.
 * 
 * ⚠️ OPTIMIZATION NOTE: For large recipient lists (>100), this fires all emails concurrently
 * which may hit Resend API rate limits or Edge Function timeout/memory limits.
 * Consider implementing:
 * - Batching (e.g., chunks of 50 recipients)
 * - Concurrency limiting (e.g., p-limit pattern)
 * - Progress tracking for long-running campaigns
 */
async function sendBulkEmail(
  resend: Resend,
  recipients: ClientRecipient[],
  subject: string,
  htmlBody: string
): Promise<any> {
  try {
    console.log(`Sending email to ${recipients.length} recipients`);
    
    // Send individual emails (Resend best practice for deliverability)
    const emailPromises = recipients.map(recipient => {
      // Personalize the email body with recipient name
      const personalizedBody = personalizeEmail(htmlBody, recipient.name);
      
      // Add unsubscribe link to personalized email
      const emailBodyWithUnsubscribe = addUnsubscribeLink(personalizedBody, recipient.email);
      
      return resend.emails.send({
        from: 'Felony Fitness <notifications@felony.fitness>',
        to: [recipient.email],
        subject: subject,
        html: emailBodyWithUnsubscribe,
        // Add recipient name to headers for tracking
        headers: {
          'X-Recipient-Name': recipient.name,
          'List-Unsubscribe': `<https://www.felony.fitness/unsubscribe-trainer?email=${encodeURIComponent(recipient.email)}>`,
        }
      });
    });
    
    // Send all emails in parallel
    const results = await Promise.allSettled(emailPromises);
    
    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Email send results: ${successful} successful, ${failed} failed`);
    
    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send to ${recipients[index].email}:`, result.reason);
      }
    });
    
    return {
      total: recipients.length,
      successful,
      failed,
      results
    };
    
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
}

// =====================================================================================
// MAIN HANDLER
// =====================================================================================

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createResponse(false, 'Method not allowed. Use POST.', null, 'INVALID_METHOD');
  }

  try {
    console.log('🚀 Starting send-trainer-email-campaign function...');

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

    // Create Supabase client with anon key for authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createResponse(false, 'Authentication required', null, 'MISSING_AUTH', 401);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const userId = await getCurrentUserId(supabaseAuth);
    if (!userId) {
      return createResponse(false, 'Authentication failed', null, 'INVALID_AUTH', 401);
    }

    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resend client
    const resend = new Resend(resendApiKey);

    console.log('✅ Clients initialized successfully');

    // ===== 3. PARSE REQUEST BODY =====
    let requestBody: CampaignRequest;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return createResponse(false, 'Invalid JSON in request body', null, 'INVALID_JSON');
    }

    const { tag_id, subject, body } = requestBody;

    console.log('Request received:', { tag_id, subject: subject?.substring(0, 50) });

    // ===== 4. VALIDATE REQUEST DATA =====
    if (!tag_id || typeof tag_id !== 'string') {
      return createResponse(false, 'tag_id is required and must be a string', null, 'INVALID_TAG_ID');
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return createResponse(false, 'subject is required and cannot be empty', null, 'INVALID_SUBJECT');
    }

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return createResponse(false, 'body is required and cannot be empty', null, 'INVALID_BODY');
    }

    console.log('✅ Request validated successfully');

    // ===== 5. GET TAG AND TRAINER INFO =====
    const { data: tag, error: tagError } = await supabase
      .from('trainer_group_tags')
      .select('id, name, trainer_id')
      .eq('id', tag_id)
      .single();

    if (tagError || !tag) {
      console.error('Tag not found:', tagError);
      return createResponse(
        false,
        'Tag not found',
        null,
        'INVALID_TAG'
      );
    }

    // Verify trainer owns this tag
    if (tag.trainer_id !== userId) {
      console.error('Unauthorized: Tag does not belong to authenticated trainer');
      return createResponse(
        false,
        'You do not have permission to send campaigns with this tag',
        null,
        'UNAUTHORIZED',
        403
      );
    }

    const trainerId = tag.trainer_id;
    console.log(`✅ Tag verified: ${tag.name} (trainer: ${trainerId})`);

    // ===== 6. FETCH RECIPIENTS =====
    const recipients = await getClientsByTag(supabase, trainerId, tag_id);

    if (recipients.length === 0) {
      return createResponse(
        false,
        'No clients found with this tag or no clients have email addresses',
        { recipient_count: 0 },
        'NO_RECIPIENTS'
      );
    }

    console.log(`✅ Found ${recipients.length} recipients`);

    // ===== 7. SEND EMAILS =====
    const sendResult = await sendBulkEmail(resend, recipients, subject, body);

    console.log('✅ Emails sent successfully');

    // ===== 8. RETURN SUCCESS RESPONSE =====
    return createResponse(
      true,
      `Campaign sent successfully to ${sendResult.successful} users!`,
      {
        tag_name: tag.name,
        total_recipients: sendResult.total,
        successful: sendResult.successful,
        failed: sendResult.failed,
        sent_at: new Date().toISOString()
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in send-trainer-email-campaign function:', error);
    return createResponse(
      false,
      'Internal server error',
      null,
      error.message || 'Unknown error occurred',
      500
    );
  }
});

console.log('📡 send-trainer-email-campaign Edge Function is ready to serve requests');
