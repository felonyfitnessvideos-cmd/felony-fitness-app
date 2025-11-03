# User Role & Tagging System Deployment Guide

## Overview

This system creates a comprehensive role-based tagging system that supports:

✅ **Multiple Tags Per User**: Users can have multiple roles (User + Trainer + Client)  
✅ **Automatic Tagging**: New users get "User" tag automatically  
✅ **Trainer-Client Relationships**: When trainer adds client, client gets "Client" tag  
✅ **System Protection**: Core tags can't be deleted accidentally  
✅ **Flexible Permissions**: Role-based access control throughout the app  

## Database Schema

### Tables Created:
1. **`tags`** - Defines available roles/tags in the system
2. **`user_tags`** - Junction table linking users to their assigned tags (many-to-many)
3. **`trainer_clients`** - Tracks trainer-client relationships with status

### Core System Tags:
- **User**: Assigned to all new signups automatically
- **Trainer**: Assigned to users who become trainers
- **Client**: Auto-assigned when user is added as someone's client
- **Admin**: System administrator access
- **Premium**: Premium subscription access

## Deployment Steps

### Step 1: Apply Database Migration
Copy the contents of `create_user_roles_system.sql` and execute it in your Supabase SQL Editor:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn)
2. Navigate to **SQL Editor**
3. Paste the migration SQL and execute it
4. Verify tables were created successfully

### Step 2: Test the System
After applying the migration, you can test the functions:

```sql
-- Check if a user has a specific tag
SELECT public.user_has_tag('YOUR_USER_ID', 'User');

-- Get all tags for a user
SELECT * FROM public.get_user_tags('YOUR_USER_ID');

-- Assign trainer role to a user
SELECT public.assign_user_tag('YOUR_USER_ID', 'Trainer');

-- Create trainer-client relationship
SELECT public.add_client_to_trainer('TRAINER_ID', 'CLIENT_ID', 'Test relationship');
```

### Step 3: Frontend Integration
The React components are ready to use:

```jsx
// Import the hook in any component
import { useUserRoles, RoleGuard } from '../hooks/useUserRoles.js';

// Use in component
function MyComponent() {
    const { isTrainer, isClient, hasRole } = useUserRoles();
    
    return (
        <RoleGuard roles="Trainer">
            <p>Only trainers can see this!</p>
        </RoleGuard>
    );
}
```

## System Features

### Automatic Behaviors:
1. **New User Signup** → Gets "User" tag automatically
2. **Trainer adds Client** → Client gets "Client" tag automatically
3. **User becomes Trainer** → Can manage clients and programs

### Tag System Properties:
- **System Tags**: Cannot be deleted (User, Trainer, Client, Admin)
- **Custom Tags**: Can be created and managed by admins
- **Multiple Roles**: Users can have multiple tags simultaneously
- **Color Coding**: Each tag has a color for UI display

### Permission System:
- **Role Checking**: Fast cached permission checking
- **Component Guards**: Show/hide components based on roles
- **Route Protection**: Can protect routes based on user roles
- **Database RLS**: Row Level Security enforces permissions

## Usage Examples

### Making Someone a Trainer:
```javascript
import userRoleUtils from '../utils/userRoleUtils.js';

// Assign trainer role
const success = await userRoleUtils.assignUserTag(userId, 'Trainer');
```

### Adding a Client:
```javascript
// This automatically gives the client the "Client" tag
const relationshipId = await userRoleUtils.addClientToTrainer(trainerId, clientId);
```

### Checking Permissions:
```javascript
import { useUserRoles } from '../hooks/useUserRoles.js';

function TrainerDashboard() {
    const { isTrainer, hasRole } = useUserRoles();
    
    if (!isTrainer) {
        return <div>Access denied</div>;
    }
    
    return <div>Trainer features here</div>;
}
```

### Conditional Rendering:
```jsx
import { RoleGuard } from '../hooks/useUserRoles.js';

<RoleGuard roles={['Trainer', 'Admin']}>
    <button>Add Client</button>
</RoleGuard>
```

## Integration with Existing Features

### Messaging System:
- Trainers can message their clients
- Clients can message their trainers
- Role-based message filtering

### Program Assignment:
- Trainers can assign programs to clients
- Clients can view trainer-assigned programs
- Role-based program visibility

### Dashboard Customization:
- Different dashboard views based on roles
- Role-specific navigation menus
- Personalized feature access

## Next Steps After Deployment

1. **Apply the Migration**: Execute the SQL in Supabase
2. **Test Core Functions**: Verify tagging works correctly
3. **Update Existing Users**: Manually assign appropriate roles to existing users
4. **Integrate Components**: Add role-based UI components where needed
5. **Update Navigation**: Modify app navigation based on user roles

## Support

The system includes comprehensive error handling, logging, and fallback mechanisms. All functions return consistent results and handle edge cases gracefully.

The messaging system we deployed earlier already references `profiles` table, which works perfectly with this role system.

## Verification Commands

After deployment, verify the system works:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tags', 'user_tags', 'trainer_clients');

-- Check if system tags were created
SELECT * FROM public.tags WHERE is_system_tag = true;

-- Check if triggers are active
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users';
```