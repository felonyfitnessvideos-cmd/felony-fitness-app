# Trainer Email Unsubscribe Page Setup

## Overview
The trainer email system needs a dedicated unsubscribe page on your website at `/unsubscribe-trainer` to handle opt-outs from trainer marketing emails.

## What's Already Done ✅

### Backend (Supabase)
1. **Database Column**: `trainer_clients.is_unsubscribed` (boolean, default false)
2. **Edge Function**: `unsubscribe-trainer-emails` - deployed and ready
3. **Email Filtering**: 
   - MessagingHub UI excludes unsubscribed clients
   - Edge Function won't send to unsubscribed clients

### Email Links
All trainer campaign emails include unsubscribe link pointing to:
```
https://www.felony.fitness/unsubscribe-trainer?email={email}
```

## What You Need to Create 🚧

### Unsubscribe Page (Website)
Create a page at `/unsubscribe-trainer` on your main website (felony.fitness).

**Required Functionality:**
1. Extract email from URL query parameter
2. Call the Supabase Edge Function
3. Display success/error message

### Example Implementation (React)

```jsx
// pages/UnsubscribeTrainer.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

function UnsubscribeTrainer() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing your request...');
  const [isSuccess, setIsSuccess] = useState(false);
  const email = searchParams.get('email');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!email) {
        setMessage('Error: No email address provided.');
        setIsSuccess(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('unsubscribe-trainer-emails', {
          body: { email }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setMessage('You have been successfully unsubscribed from trainer marketing emails.');
          setIsSuccess(true);
        } else {
          throw new Error(data.error || 'Failed to unsubscribe');
        }
      } catch (err) {
        console.error('Unsubscribe error:', err);
        setMessage(`An error occurred: ${err.message}`);
        setIsSuccess(false);
      }
    };

    handleUnsubscribe();
  }, [email]);

  return (
    <div style={{ 
      padding: '3rem', 
      maxWidth: '600px', 
      margin: '0 auto', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Unsubscribe from Trainer Emails</h1>
      <p style={{ 
        fontSize: '1.1rem', 
        color: isSuccess ? '#10b981' : '#6b7280',
        marginBottom: '2rem'
      }}>
        {message}
      </p>
      
      {isSuccess && (
        <div style={{ 
          padding: '1rem', 
          background: '#d1fae5', 
          borderRadius: '8px',
          color: '#065f46',
          marginBottom: '1rem'
        }}>
          <p><strong>Note:</strong> You will still receive important transactional emails from your trainer (workout updates, session reminders, etc.)</p>
        </div>
      )}
      
      <a href="https://www.felony.fitness" style={{
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        background: '#f97316',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600'
      }}>
        Return to Felony Fitness
      </a>
    </div>
  );
}

export default UnsubscribeTrainer;
```

### Add Route
Add to your website's router:
```jsx
<Route path="/unsubscribe-trainer" element={<UnsubscribeTrainer />} />
```

## Database Migration

Run this SQL in Supabase SQL Editor:
```sql
-- Add is_unsubscribed column
ALTER TABLE trainer_clients
ADD COLUMN IF NOT EXISTS is_unsubscribed BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_trainer_clients_email_unsubscribed 
ON trainer_clients(email, is_unsubscribed);
```

## Testing

1. **Send Test Email**: Use messaging hub to send email to test client
2. **Click Unsubscribe**: Check email and click unsubscribe link
3. **Verify Database**: Check `trainer_clients.is_unsubscribed = true`
4. **Verify UI**: Test client should disappear from messaging hub
5. **Verify Emails**: Sending to that group should skip unsubscribed client

## Edge Function Details

**Endpoint**: `unsubscribe-trainer-emails`
**Method**: POST
**Body**: `{ email: "user@example.com" }`
**Response**: 
```json
{
  "success": true,
  "message": "Successfully unsubscribed from trainer emails",
  "updated_count": 2
}
```

## Important Notes

- ✅ Unsubscribe applies to **all trainers** the client is associated with
- ✅ Does **not** affect transactional emails (workout reminders, session notifications)
- ✅ Only affects marketing emails sent through the messaging hub
- ✅ Unsubscribed clients are hidden from trainer's messaging hub UI
- ✅ Includes automatic name personalization with `[Name]` placeholders

## Support

If users have issues unsubscribing, they can:
1. Contact their trainer directly
2. Email support@felony.fitness with their email address
3. You can manually update: `UPDATE trainer_clients SET is_unsubscribed = true WHERE email = 'user@example.com';`
