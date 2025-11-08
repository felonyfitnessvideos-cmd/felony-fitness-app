# Messaging: needs_response System

## Overview

The messaging system now tracks whether messages need responses using a `needs_response` boolean column. This ensures trainers only see notifications for client messages that haven't been answered.

## Database Schema

### direct_messages table

```sql
needs_response BOOLEAN DEFAULT true
```

### Index

```sql
CREATE INDEX idx_direct_messages_needs_response
ON direct_messages(recipient_id, needs_response)
WHERE needs_response = true;
```

## Logic Flow

### Client → Trainer Message

```javascript
// When client sends message to trainer
{
  sender_id: clientId,
  recipient_id: trainerId,
  content: "Need help with form",
  needs_response: true  // ← Trainer needs to respond
}
```

### Trainer → Client Message

```javascript
// When trainer replies to client
{
  sender_id: trainerId,
  recipient_id: clientId,
  content: "Here's a form video...",
  needs_response: false  // ← Client doesn't need to respond
}

// ALSO: Mark all previous messages from this client as responded
UPDATE direct_messages
SET needs_response = false
WHERE sender_id = clientId
  AND recipient_id = trainerId
  AND needs_response = true;
```

## Unread Count Behavior

### For Trainers

```javascript
// Count only messages needing response
SELECT COUNT(*) FROM direct_messages
WHERE recipient_id = trainerId
  AND needs_response = true;
```

### For Clients

```javascript
// Count unread messages (standard behavior)
SELECT COUNT(*) FROM direct_messages
WHERE recipient_id = clientId
  AND read_at IS NULL;
```

## UI Implementation

### Badge Position

- **Location**: Right side of Messages button
- **Color**: Red (#dc2626)
- **Display**: Shows count or "9+" if over 9

### Badge Logic

- **Trainer Dashboard**: Shows messages needing trainer response
- **Client Dashboard**: Shows unread messages from trainers
- Auto-updates via real-time subscriptions

## Benefits

1. **Focused Notifications**: Trainers only see client messages awaiting response
2. **Conversation Threading**: Once trainer replies, all client messages in that thread are marked as responded
3. **Clean Workflow**: No clutter from messages that don't need action
4. **Two-Way Tracking**: Different logic for trainer vs client roles

## Example Scenario

```
Client sends: "How should I progress this week?"
→ needs_response = true (trainer badge: 1)

Trainer replies: "Let's add 5lbs to squats"
→ needs_response = false
→ Previous client message marked needs_response = false
→ Trainer badge: 0

Client reads message
→ No change to needs_response
→ Trainer badge: 0 (stays at 0)

Client sends another: "Got it, thanks!"
→ needs_response = true
→ Trainer badge: 1
```

## Testing

1. Log in as client
2. Send message to trainer
3. Log in as trainer
4. Verify badge shows "1"
5. Reply to client
6. Verify badge shows "0"
7. Log in as client
8. Send another message
9. Verify trainer badge shows "1" again

## Migration Applied

See: `supabase/migrations/20251108000000_add_needs_response_to_messages.sql`

Executed via SQL Editor on 2025-11-08.
