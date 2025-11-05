# Role Assignment System Test Plan

## 🎯 **Test Objective**
Verify that the role assignment system works correctly when creating trainer-client relationships and that the dashboard properly reflects the assigned roles.

## 📋 **Pre-Test Setup**

### Step 1: Clean Up Current Relationships
1. Open your Supabase dashboard or SQL editor
2. Run the cleanup script: `cleanup_my_trainer_client_relationships.sql`
3. Execute the SELECT statements first to see your current state
4. Uncomment and run the DELETE statements to clear relationships
5. Optionally clear your current role tags to start fresh

### Step 2: Verify Clean State
After cleanup, verify:
- ✅ No trainer-client relationships in `trainer_clients` table
- ✅ No "Trainer" or "Client" tags in your `user_tags`
- ✅ Main dashboard should NOT show messaging card
- ✅ Role system test should show minimal roles

## 🧪 **Test Execution**

### Test Case 1: Role Assignment During Onboarding

**Action:** Go through the trainer onboarding process
1. Navigate to http://localhost:5174
2. Go to the Trainer Dashboard
3. Navigate to "Clients" section
4. Add yourself as a client (or have someone add you)

**Expected Results:**
- ✅ Console should show: "✅ Trainer-client relationship created, assigning roles..."
- ✅ Console should show: "🏋️ Trainer role assigned: true"
- ✅ Console should show: "👤 Client role assigned: true"
- ✅ No JavaScript errors in console
- ✅ Success message for adding client

### Test Case 2: Role Detection on Main Dashboard

**Action:** Navigate to the main dashboard
1. Go to http://localhost:5174/dashboard
2. Check for the messaging component
3. Look at the role system test component

**Expected Results:**
- ✅ Messaging card should appear (since you now have Client role)
- ✅ Messaging card should show "No Trainers Yet" or trainer list
- ✅ Role system test should show both "Trainer" and "Client" roles
- ✅ Page should load without errors

### Test Case 3: Messaging Functionality

**Action:** Test the messaging component
1. On the main dashboard, find the messaging card
2. If it shows trainer list, try to send a message
3. Verify the interface is functional

**Expected Results:**
- ✅ Messaging interface should be visible and functional
- ✅ Should show trainer information
- ✅ Message input should be enabled
- ✅ No "Coming Soon" messages

## 🔍 **Verification Points**

### Database Verification
Check these tables in Supabase:
```sql
-- Check your trainer-client relationships
SELECT * FROM trainer_clients WHERE trainer_id = 'YOUR_USER_ID' OR client_id = 'YOUR_USER_ID';

-- Check your assigned roles
SELECT ut.*, t.name as tag_name 
FROM user_tags ut 
JOIN tags t ON t.id = ut.tag_id 
WHERE ut.user_id = 'YOUR_USER_ID';
```

### Browser Console Verification
Look for these console messages:
- ✅ Role assignment success messages
- ✅ No errors about missing functions (fallbacks should work)
- ✅ Successful role loading messages
- ❌ No "function not found" errors

### UI Verification
Visual checks:
- ✅ Main dashboard shows messaging card
- ✅ Trainer dashboard shows client list
- ✅ Role system test shows multiple roles
- ✅ No "Coming Soon" placeholders

## 🐛 **Troubleshooting**

### If Roles Don't Get Assigned:
1. Check browser console for errors
2. Verify fallback functions are working
3. Check if database functions exist
4. Try manual role assignment via SQL

### If Messaging Card Doesn't Appear:
1. Check if `isClient` flag is true in browser dev tools
2. Verify roles were loaded correctly
3. Check for JavaScript errors
4. Try refreshing the page

### If Database Functions Are Missing:
The fallback system should handle this automatically, but you can verify:
```sql
-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname IN ('get_user_tags', 'assign_user_tag');
```

## 📊 **Success Criteria**

The test is successful if:
1. ✅ Roles are automatically assigned during trainer-client relationship creation
2. ✅ Main dashboard shows messaging functionality for clients
3. ✅ System works with or without database functions (fallbacks work)
4. ✅ No console errors or broken functionality
5. ✅ User experience is smooth and intuitive

## 🎉 **Post-Test**

After successful testing:
- Document any issues found
- Verify the system works for new users
- Test edge cases (multiple trainers, role removal, etc.)
- Consider deploying to production if all tests pass