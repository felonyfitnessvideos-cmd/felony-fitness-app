/**
 * @fileoverview Send Routine Reminder Edge Function
 * @description Sends custom branded email notifications to clients about upcoming workout sessions.
 * Triggered by cron job and uses Resend for email delivery with deep links to the app.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires Deno
 * @requires Supabase
 * @requires Resend
 * 
 * Request Body:
 * - scheduled_routine_id: UUID of the scheduled routine
 * 
 * @example
 * // POST to /functions/v1/send-routine-reminder
 * {
 *   "scheduled_routine_id": "uuid-here"
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderRequest {
  scheduled_routine_id: string;
}

/**
 * Generate custom HTML email template for routine reminder
 */
function generateReminderEmail(
  clientName: string, 
  routineName: string, 
  deepLinkUrl: string,
  startTime: string
): string {
  const formattedTime = new Date(startTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workout Reminder - Felony Fitness</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #e53e3e;
                margin-bottom: 10px;
            }
            .title {
                font-size: 28px;
                font-weight: bold;
                color: #2d3748;
                margin-bottom: 20px;
            }
            .routine-name {
                font-size: 20px;
                font-weight: 600;
                color: #e53e3e;
                background-color: #fed7d7;
                padding: 10px 20px;
                border-radius: 8px;
                display: inline-block;
                margin: 10px 0;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                color: #4a5568;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
            }
            .time-info {
                background-color: #f7fafc;
                border-left: 4px solid #e53e3e;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 14px;
            }
            .tips {
                background-color: #edf2f7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .tips h3 {
                color: #2d3748;
                margin-top: 0;
                font-size: 18px;
            }
            .tips ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .tips li {
                margin: 8px 0;
                color: #4a5568;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💪 FELONY FITNESS</div>
                <h1 class="title">Workout Reminder</h1>
            </div>

            <div class="message">
                <p>Hey there <strong>${clientName}</strong>! 👋</p>
                
                <p>Don't forget it's <span class="routine-name">${routineName}</span> time!</p>
                
                <div class="time-info">
                    <strong>⏰ Scheduled for:</strong> ${formattedTime}
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${deepLinkUrl}" class="cta-button">
                    🚀 Open Routine in App
                </a>
            </div>

            <div class="tips">
                <h3>💡 Pre-Workout Tips:</h3>
                <ul>
                    <li>🥤 Drink plenty of fluids (start hydrating now!)</li>
                    <li>🍌 Have a light snack if needed (30-60 mins before)</li>
                    <li>🧘‍♀️ Take 5 minutes to mentally prepare and visualize your session</li>
                    <li>📱 Make sure your phone is charged for logging your workout</li>
                </ul>
            </div>

            <div class="message">
                <p>Remember to check in with me after your cool down - I want to hear how it went! 💪</p>
                
                <p>You've got this!</p>
                
                <p><strong>Your Trainer</strong> 🏋️‍♀️</p>
            </div>

            <div class="footer">
                <p>This reminder was sent from the Felony Fitness app.</p>
                <p>Having trouble with the button? Copy and paste this link:</p>
                <p style="word-break: break-all; color: #4299e1;">${deepLinkUrl}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Resend with API key
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    if (!resend) {
      throw new Error('Resend API key not configured');
    }

    // Initialize Supabase admin client (service role for database access)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestData: ReminderRequest = await req.json();
    const { scheduled_routine_id } = requestData;

    if (!scheduled_routine_id) {
      throw new Error('scheduled_routine_id is required');
    }

    // Step 2: Fetch the scheduled routine record
    const { data: scheduledRoutine, error: routineError } = await supabaseAdmin
      .from('scheduled_routines')
      .select(`
        id,
        client_id,
        routine_name,
        start_time,
        trainer_id
      `)
      .eq('id', scheduled_routine_id)
      .single();

    if (routineError || !scheduledRoutine) {
      throw new Error(`Scheduled routine not found: ${routineError?.message}`);
    }

    // Step 3 & 4: Get client's name and email
    const { data: clientProfile, error: clientError } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', scheduledRoutine.client_id)
      .single();

    if (clientError || !clientProfile) {
      throw new Error(`Client profile not found: ${clientError?.message}`);
    }

    if (!clientProfile.email) {
      throw new Error('Client email not found');
    }

    // Step 5: Build the deep link URL
    const deepLinkUrl = `https://app.felony.fitness/log-workout/${scheduled_routine_id}`;

    // Step 6: Send the Resend email
    const emailHtml = generateReminderEmail(
      clientProfile.full_name || 'Champion',
      scheduledRoutine.routine_name,
      deepLinkUrl,
      scheduledRoutine.start_time
    );

    const emailResult = await resend.emails.send({
      from: 'Felony Fitness <notifications@felony.fitness>',
      to: [clientProfile.email],
      subject: `⏰ Reminder: It's ${scheduledRoutine.routine_name} time!`,
      html: emailHtml,
    });

    if (emailResult.error) {
      throw new Error(`Failed to send email: ${emailResult.error.message}`);
    }

    // Update the notification queue if it exists
    await supabaseAdmin
      .from('notification_queue')
      .update({ 
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('data->scheduled_routine_id', scheduled_routine_id)
      .eq('type', 'routine_reminder');

    // Log successful send
    console.log(`Reminder sent successfully for routine ${scheduled_routine_id} to ${clientProfile.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reminder sent successfully',
        data: {
          scheduled_routine_id,
          client_email: clientProfile.email,
          email_id: emailResult.data?.id,
          deep_link: deepLinkUrl
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Send reminder error:', error);

    // Update notification queue with error if it exists
    try {
      const requestData = await req.clone().json();
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseAdmin
        .from('notification_queue')
        .update({ 
          error_message: error.message,
          retry_count: supabaseAdmin.rpc('increment_retry_count', { id: requestData.scheduled_routine_id }),
          updated_at: new Date().toISOString()
        })
        .eq('data->scheduled_routine_id', requestData.scheduled_routine_id)
        .eq('type', 'routine_reminder');
    } catch (updateError) {
      console.error('Failed to update notification queue with error:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send routine reminder'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})

/* To deploy this function, run:
deno run --allow-net supabase/functions/send-routine-reminder/index.ts
*/