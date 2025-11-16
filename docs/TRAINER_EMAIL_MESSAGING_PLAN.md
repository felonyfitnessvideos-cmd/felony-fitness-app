# Trainer Email Messaging Platform - Implementation Plan

## 📋 Executive Summary

We're building a comprehensive email messaging system for trainers in the Messaging Hub workspace tool. This will enable trainers to:
- Create client groups (tags) for group fitness classes or campaigns
- Send bulk emails to groups using Resend API
- Create and save email templates with TinyMCE editor
- Manage group memberships with a simple client list interface

## 🎯 Current State Analysis

### ✅ What We Have

1. **Admin Email System Reference** (`AdminEmailCopy/`)
   - `AdminConsole.jsx` - Full-featured email console with TinyMCE editor
   - Modal-based email composition
   - Tag/group management system
   - Template creation and management
   - Resend API integration via Edge Function

2. **Existing Infrastructure**
   - `trainer_clients` table with columns:
     - `trainer_id`, `client_id`, `status`, `email`, `full_name`
   - Working Resend Edge Function (`send-message`)
   - TinyMCE already available (used in admin console)
   - React Modal library already installed

3. **Messaging Hub Location**
   - Core Tools Workspace in TrainerDashboard
   - Currently shows placeholder cards
   - Located at: `TrainerDashboard.jsx` line 263 (`renderWorkspaceContent()`)

4. **Client List**
   - `TrainerClients.jsx` already displays trainer's clients
   - Search functionality implemented
   - Client selection callback available

## 🏗️ What We Need to Build

### 1. Database Tables (Simplified Tagging System)

**ONLY 2 NEW TABLES NEEDED** - Using existing `trainer_clients` table for memberships!

```sql
-- Trainer group tags (like admin's tags table, but trainer-scoped)
CREATE TABLE trainer_group_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Monday Bootcamp", "Beach Event"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trainer_id, name) -- Each trainer's tag names must be unique
);

-- Email templates (trainer-specific)
CREATE TABLE trainer_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL, -- HTML content from TinyMCE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MODIFY EXISTING TABLE: Add tags column to trainer_clients
ALTER TABLE trainer_clients 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
-- Stores array of tag IDs: ['uuid-1', 'uuid-2', 'uuid-3']

CREATE INDEX IF NOT EXISTS idx_trainer_clients_tags 
ON trainer_clients USING GIN(tags);
```

**Why This Works:**
- ✅ No separate membership table needed
- ✅ Client tags stored directly in `trainer_clients.tags` array
- ✅ Simple to query: "Get all clients with tag X"
- ✅ No campaign tracking table (trainers just send, no analytics needed)
- ✅ Minimal schema changes

### 2. Edge Function Enhancement

**New Edge Function: `send-trainer-email-campaign`**
- Similar to admin's `send-email-campaign` but trainer-scoped
- Accepts: `{ tag_id, subject, body }`
- Queries `trainer_clients` WHERE `tag_id = ANY(tags)` to get recipients
- Sends bulk email via Resend API
- No campaign logging (trainers just send and forget)

### 3. React Components

#### A. **MessagingHub Component** (New)
**Location**: `src/components/trainer/MessagingHub.jsx`

**Based on Screenshot #1 - UI Features**:
- Left side: Orange group tag buttons (Monday Bootcamp, Beach Event, etc.)
- Right side: Input for "New Group name" + "Create Group" button
- Below: Client List panel with "+Add" buttons
- Clean, simple layout matching the workspace tool style

**Structure**:
```jsx
<div className="messaging-hub-workspace">
  {/* Left: Group Buttons */}
  <div className="group-tags-section">
    {groupTags.map(tag => (
      <button 
        key={tag.id}
        onClick={() => openEmailComposer(tag)}
        className="group-tag-button"
      >
        {tag.name}
      </button>
    ))}
  </div>
  
  {/* Right: Create Group + Client List */}
  <div className="create-group-section">
    <input 
      placeholder="New Group name"
      value={newGroupName}
      onChange={(e) => setNewGroupName(e.target.value)}
    />
    <button onClick={handleCreateGroup}>Create Group</button>
    
    <div className="client-list-panel">
      <h4>[Client List]</h4>
      {clients.map(client => (
        <div className="client-row">
          <span>{client.name}</span>
          <button onClick={() => toggleClientTag(client.id)}>
            {clientHasCurrentTag(client) ? 'Added' : '+Add'}
          </button>
        </div>
      ))}
    </div>
  </div>
</div>
```

#### B. **Group Creation Flow** (Inline, No Modal)
**Based on Screenshot #1 - Simple Workflow**:

1. Trainer types group name in "New Group name" input
2. Clicks "Create Group" button
3. New orange button appears immediately on left
4. Group is now "active" (selected automatically)
5. Client list shows with "+Add" buttons
6. Trainer clicks "+Add" next to each client they want
7. Button changes to "Added" and client gets tagged
8. Tag is added to `trainer_clients.tags` array immediately

**No modal needed** - Everything happens inline in the workspace!

#### C. **EmailComposerModal Component** (New)
**Based on Screenshot #2 - Full Email Composer**

**Features**:
- Large modal overlay (using react-modal)
- **Top Section**:
  - "Select Template" dropdown (shows saved templates)
  - "Send To" → "Select Group" dropdown (shows tag buttons as options)
  - "Email Subject" input field
- **Action Buttons**:
  - Orange "Send to X Users" button (shows recipient count)
  - Gray "Save as Template" button
- **Editor Section**:
  - TinyMCE editor with toolbar (paragraph, bold, italic, lists, etc.)
  - Word count at bottom
  - "Build with TinyMCE" branding
- **Success Message**:
  - Green banner at bottom: "Campaign sent successfully to X users!"

**Styling**: Dark theme matching admin console (dark gray background, white text)

### 4. Integration Points

#### Update TrainerDashboard.jsx
```jsx
// Replace line 263 placeholder
case 'messaging':
  return <MessagingHub />;
```

#### Update Core Tools Button
When trainer clicks "Messaging Hub" button in workspace:
- Fetch trainer's groups
- Display group buttons
- Enable email composition

### 5. Data Flow

**Creating a Group Tag**:
```
1. Trainer types "Monday Bootcamp" in input
2. Clicks "Create Group"
3. INSERT into trainer_group_tags
4. Orange button appears immediately
5. Group auto-selected (activeTag state)
6. Client list shows with "+Add" buttons ready
```

**Adding Clients to Group**:
```
1. Trainer clicks "+Add" next to client name
2. UPDATE trainer_clients SET tags = array_append(tags, 'tag-uuid')
3. Button changes to "Added" (disabled state)
4. Client now in this group
```

**Sending Email Campaign**:
```
1. Trainer clicks orange group button (e.g., "Monday Bootcamp")
2. EmailComposerModal opens with group pre-selected
3. Trainer selects template OR writes custom email
4. Clicks "Send to X Users"
5. Edge Function:
   - Queries: SELECT * FROM trainer_clients WHERE 'tag-uuid' = ANY(tags)
   - Extracts emails from results
   - Sends bulk via Resend API
6. Success message: "Campaign sent successfully to X users!"
7. Modal stays open for another send (or closes)
```

**Template Management**:
```
1. Trainer writes email in composer
2. Clicks "Save as Template"
3. Prompt for template name appears
4. INSERT into trainer_email_templates
5. Template appears in "Select Template" dropdown
6. Can load anytime with subject + body pre-filled
```

## 🎨 UI/UX Considerations (From Screenshots)

### Messaging Hub Layout (Screenshot #1)
```
┌─────────────────────────────────────────────────────────────────┐
│ [Smart Scheduling] [Progress Tracker] [Workout Builder] etc.   │
│                                      [💬 Messaging Hub] ← ACTIVE│
├──────────────────────┬──────────────────────────────────────────┤
│  GROUP TAGS (Left)   │  CREATE & CLIENT LIST (Right)            │
│                      │                                          │
│  🟧 Monday Bootcamp  │  New Group name: [_____________]  [Create│
│  🟧 Beach Event      │                                   Group] │
│  🟧 Wednesday        │                                          │
│     Bootcamp         │  [Client List]                          │
│  🟧 Booty Blast      │  ┌────────────────────────────────────┐ │
│     Bootcamp         │  │ John Doe              [Added]      │ │
│  🟧 Pilates Class    │  │ Jane Smith            [+Add]       │ │
│  🟧 Park Run Event   │  │ Mike Johnson          [+Add]       │ │
│                      │  └────────────────────────────────────┘ │
└──────────────────────┴──────────────────────────────────────────┘
```

### Email Composer Modal (Screenshot #2)
```
┌─────────────────────────────────────────────────────────────────┐
│  Select Template                                                │
│  [-- Start with a blank email --              ▼]               │
│                                                                 │
│  Send To                                                        │
│  [Select Group                                ▼]               │
│                                                                 │
│  [Email Subject_________________________________]               │
│                                                                 │
│  [Send to 1 Users]  [Save as Template]                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ <> ↶ ↷   [Paragraph ▼]  B I  ≡ ≣  ⋯                    │  │
│  │                                                           │  │
│  │                                                           │  │
│  │  [Email composition area - TinyMCE]                       │  │
│  │                                                           │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               0 words    Build with ⓣ tinyMCE  │
│                                                                 │
│  ✅ Campaign sent successfully to 1 users!                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Security & RLS Policies

Only 2 tables need RLS policies:

```sql
-- trainer_group_tags (trainers only see their own tags)
CREATE POLICY "Trainers can CRUD their own group tags" 
ON trainer_group_tags 
FOR ALL 
USING (auth.uid() = trainer_id);

-- trainer_email_templates (trainers only see their own templates)
CREATE POLICY "Trainers can CRUD their own templates" 
ON trainer_email_templates 
FOR ALL 
USING (auth.uid() = trainer_id);

-- trainer_clients already has RLS policies ✅
-- No changes needed, just querying the tags column
```

## 📦 Dependencies

Already available:
- ✅ TinyMCE React (`@tinymce/tinymce-react`)
- ✅ React Modal (`react-modal`)
- ✅ Lucide Icons (`lucide-react`)
- ✅ Resend API integration
- ✅ Supabase client

Environment variables needed:
- ✅ `VITE_TINYMCE_API_KEY` (already in use by admin)
- ✅ `RESEND_API_KEY` (already configured in Edge Functions)

## 🧪 Testing Strategy

1. **Database Tables**
   - Create tables via SQL migration
   - Test RLS policies with different trainer accounts
   - Verify cascade deletions work

2. **Group Creation**
   - Create group with 0 clients (should work)
   - Create group with multiple clients
   - Try duplicate group names (should allow)
   - Delete group (should remove members)

3. **Email Sending**
   - Send to group with 1 client
   - Send to group with multiple clients
   - Verify Resend API receives correct data
   - Test with template vs custom email

4. **UI Integration**
   - Group buttons appear in Messaging Hub
   - Modal opens/closes properly
   - TinyMCE editor loads and saves content
   - Client list filters correctly

## 📝 Implementation Checklist (Simplified)

### Phase 1: Database Setup ✅ MINIMAL SCHEMA
- [ ] Create `trainer_group_tags` table
- [ ] Create `trainer_email_templates` table  
- [ ] Add `tags` column to existing `trainer_clients` table
- [ ] Add RLS policies (only 2 tables)
- [ ] Add GIN index on `trainer_clients.tags`

### Phase 2: Edge Function
- [ ] Create `send-trainer-email-campaign` Edge Function
- [ ] Query clients by tag: `WHERE 'tag-uuid' = ANY(tags)`
- [ ] Integrate Resend API (copy from admin)
- [ ] Test with Postman

### Phase 3: Core Components (Based on Screenshots)
- [ ] Build `MessagingHub.jsx` (Screenshot #1 layout)
  - Left: Group tag buttons (orange)
  - Right: New group input + client list with +Add buttons
- [ ] Build `EmailComposerModal.jsx` (Screenshot #2)
  - Template selector dropdown
  - Group selector dropdown
  - TinyMCE editor
  - Send/Save buttons
  - Success message banner
- [ ] Create `MessagingHub.css` (dark theme, orange accents)

### Phase 4: Integration
- [ ] Update `TrainerDashboard.jsx` line 263
- [ ] Replace placeholder with `<MessagingHub />`
- [ ] Connect to existing `trainer_clients` data
- [ ] Test inline group creation
- [ ] Test client tagging flow
- [ ] Test email sending

### Phase 5: Polish
- [ ] Loading states on buttons
- [ ] Error handling with user feedback
- [ ] Success notifications (green banner)
- [ ] Disable "Added" buttons
- [ ] Update recipient count dynamically

## 🎯 Success Criteria

✅ Trainer can create a group with custom name  
✅ Trainer can add clients to group via modal  
✅ Group appears as clickable button in Messaging Hub  
✅ Clicking group opens email composer  
✅ Trainer can compose email with TinyMCE  
✅ Trainer can save email as template  
✅ Trainer can load saved templates  
✅ Trainer can send email to all group members  
✅ Clients receive emails via Resend  
✅ Campaign is logged for analytics  

## 🚀 Future Enhancements (Not in Scope)

- Email open tracking
- Click tracking on links
- A/B testing for subject lines
- Scheduled/delayed sending
- Email templates marketplace
- Unsubscribe management
- Email analytics dashboard
- Merge tags (personalization)

## 📚 Code References

**Existing Code to Adapt**:
- `AdminEmailCopy/AdminConsole.jsx` - Email UI patterns
- `src/pages/trainer/TrainerClients.jsx` - Client list patterns
- `supabase/functions/send-message/index.ts` - Resend integration
- `src/components/SmartScheduling.jsx` - Workspace tool patterns

**New Files to Create**:
- `src/components/trainer/MessagingHub.jsx` (Screenshot #1 layout)
- `src/components/trainer/EmailComposerModal.jsx` (Screenshot #2)
- `src/components/trainer/MessagingHub.css` (Dark theme + orange buttons)
- `supabase/functions/send-trainer-email-campaign/index.ts`
- `scripts/create-trainer-email-system.sql` (Only 2 tables + 1 column!)

---

## ✅ Ready to Proceed?

This plan provides:
1. ✅ Clear database schema
2. ✅ Component architecture
3. ✅ UI/UX mockups
4. ✅ Integration points
5. ✅ Security considerations
6. ✅ Testing strategy
7. ✅ Implementation phases

## ✅ FINAL SIMPLIFIED ARCHITECTURE

**Database Changes**:
- ✅ Add 2 new tables: `trainer_group_tags`, `trainer_email_templates`
- ✅ Add 1 column: `trainer_clients.tags` (TEXT[] array)
- ✅ NO membership table, NO campaign tracking

**Components**:
- ✅ `MessagingHub.jsx` - Group buttons + inline client list (Screenshot #1)
- ✅ `EmailComposerModal.jsx` - Full email composer (Screenshot #2)
- ✅ Inline group creation (no modal needed!)

**Flow**:
1. Create group → Orange button appears
2. Click "+Add" on clients → Tags added to `trainer_clients.tags[]`
3. Click group button → Email composer modal opens
4. Send → Edge Function queries by tag → Resend sends bulk email
5. Success banner shows

**Simple. Clean. Minimal schema. Maximum impact.** 🚀

Ready to start building Phase 1 (Database Setup)?
