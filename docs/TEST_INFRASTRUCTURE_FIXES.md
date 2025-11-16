# Test Infrastructure Fixes - Action Plan

## Executive Summary
The CI tests are timing out after 30 minutes due to:
1. Excessive `waitFor` calls without timeouts (42+ in MyPlanPage alone)
2. Missing cleanup for Supabase mocks and subscriptions
3. Duplicate setup files causing potential conflicts
4. No test isolation - tests may be interfering with each other

## Critical Fixes (Immediate Action Required)

### Fix 1: Reduce waitFor Timeout Globally
**File**: `vitest.config.js`

Add to test configuration:
```javascript
test: {
  environment: 'jsdom',
  setupFiles: ['./tests/setup.jsx'],
  
  // ADD THIS:
  waitForTimeout: 1000, // Max 1 second for waitFor (default is too long)
  
  testTimeout: 5000,
  hookTimeout: 10000,
  // ...rest of config
}
```

### Fix 2: Remove Duplicate Setup File
**Action**: Delete `src/test/setup.js` - it's redundant with `tests/setup.jsx`

**Reason**: Having two setup files can cause:
- Double mock initialization
- Conflicting configurations
- Unpredictable test behavior

### Fix 3: Add Supabase Mock Cleanup
**File**: `tests/setup.jsx`

Add to `afterEach` block:
```javascript
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  
  // ADD THIS SECTION:
  // Cleanup any Supabase subscriptions or listeners
  if (global.supabase) {
    // Clear any active subscriptions
    if (global.supabase.removeAllChannels) {
      global.supabase.removeAllChannels();
    }
    // Reset auth state
    if (global.supabase.auth.onAuthStateChange) {
      global.supabase.auth.onAuthStateChange = vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }));
    }
  }
  
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
```

### Fix 4: Refactor Tests with Excessive WaitFor
**File**: `tests/pages/MyPlanPage.test.jsx` (42+ waitFor calls)

**Problem Pattern**:
```javascript
// Current (slow, can hang):
it('renders the page title', async () => {
  render(<MyPlanPage />);
  await waitFor(() => {
    expect(screen.getByText('My Plan')).toBeInTheDocument();
  });
});
```

**Better Pattern**:
```javascript
// Improved (fast, explicit):
it('renders the page title', async () => {
  render(<MyPlanPage />);
  // If it's immediately visible, don't use waitFor
  expect(screen.getByText('My Plan')).toBeInTheDocument();
});

// OR if it requires async:
it('loads user data', async () => {
  render(<MyPlanPage />);
  const userName = await screen.findByText('test@example.com', 
    {}, 
    { timeout: 2000 } // Explicit timeout
  );
  expect(userName).toBeInTheDocument();
});
```

### Fix 5: Split Large Test Files
**Files to Split**:
- `MyPlanPage.test.jsx` (959 lines, 42+ async operations)
- `MesocycleBuilder.test.jsx` (420+ lines)
- `CycleWeekEditor.test.jsx` (310+ lines)

**Strategy**:
```
tests/pages/MyPlanPage/
  ├── MyPlanPage.rendering.test.jsx
  ├── MyPlanPage.data-loading.test.jsx
  ├── MyPlanPage.user-interactions.test.jsx
  └── MyPlanPage.error-handling.test.jsx
```

**Benefits**:
- Faster CI (parallel execution)
- Easier to identify which specific area is failing
- Better test isolation

### Fix 6: Add Test Timeout Guards
**File**: `vitest.config.js`

Update configuration:
```javascript
test: {
  environment: 'jsdom',
  setupFiles: ['./tests/setup.jsx'],
  
  // Aggressive timeouts for CI
  testTimeout: 3000,        // 3 seconds per test (down from 5)
  hookTimeout: 5000,        // 5 seconds for beforeEach/afterEach (down from 10)
  teardownTimeout: 5000,    // ADD THIS - cleanup timeout
  
  // Pool configuration for better parallelization
  pool: 'forks',            // CHANGE from 'threads' - better isolation
  poolOptions: {
    forks: {
      singleFork: false,    // Allow parallel test files
      maxForks: 4,          // Limit to 4 parallel processes
      minForks: 1
    }
  },
  
  // Fail fast in CI
  bail: 1,                  // CHANGE from 0 - stop on first failure
  
  // Other config...
}
```

### Fix 7: Update CI Workflow Timeout
**File**: `.github/workflows/ci.yml`

```yaml
jobs:
  quality-checks:
    name: Code Quality & Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15  # CHANGE from 30 - should never take this long
    
    steps:
    # ... existing steps ...
    
    - name: Run tests with coverage
      run: npm run test:ci
      timeout-minutes: 10  # ADD sub-timeout for just tests
```

## Test Strategy Improvements

### Strategy 1: Tiered Testing
**Create 3 test commands**:

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:fast": "vitest run --no-coverage --changed",
    "test:unit": "vitest run tests/utils tests/components/RestTimerModal",
    "test:integration": "vitest run tests/pages tests/components/CycleWeekEditor",
    "test:ci": "npm run test:unit && npm run test:integration"
  }
}
```

**Benefits**:
- Unit tests run first (fast feedback)
- If units fail, skip expensive integration tests
- CI completes in <5 minutes instead of 30+

### Strategy 2: Mock Supabase Properly
**Create**: `tests/mocks/supabase.js`

```javascript
export const createMockSupabase = () => {
  const subscriptions = [];
  const authCallbacks = [];
  
  return {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      })),
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: { id: 'test-user-id' } } }, 
        error: null 
      })),
      onAuthStateChange: vi.fn((callback) => {
        authCallbacks.push(callback);
        return {
          data: { subscription: { unsubscribe: vi.fn() } }
        };
      }),
      signOut: vi.fn(() => Promise.resolve({ error: null }))
    },
    channel: vi.fn((name) => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => {
        const sub = { unsubscribe: vi.fn() };
        subscriptions.push(sub);
        return sub;
      })
    })),
    // Cleanup function for tests
    __cleanup: () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      subscriptions.length = 0;
      authCallbacks.length = 0;
    }
  };
};
```

**Usage in setup.jsx**:
```javascript
import { createMockSupabase } from './mocks/supabase';

let mockSupabase;

beforeEach(() => {
  mockSupabase = createMockSupabase();
  vi.mock('../src/supabaseClient', () => ({
    default: mockSupabase,
    supabase: mockSupabase
  }));
});

afterEach(() => {
  mockSupabase.__cleanup();
  cleanup();
  vi.clearAllMocks();
});
```

## Immediate Action Items

### Priority 1 (Do First):
1. ✅ Delete `src/test/setup.js` (duplicate)
2. ✅ Update `vitest.config.js` with stricter timeouts and `bail: 1`
3. ✅ Change CI timeout from 30 to 15 minutes

### Priority 2 (Do Next):
4. ✅ Add Supabase mock cleanup to `tests/setup.jsx`
5. ✅ Create `tests/mocks/supabase.js` with proper cleanup
6. ✅ Split `test:ci` into unit and integration stages

### Priority 3 (Do Soon):
7. Refactor `MyPlanPage.test.jsx` - reduce waitFor usage
8. Split large test files into smaller focused files
9. Add explicit timeouts to remaining waitFor calls

### Priority 4 (Nice to Have):
10. Add test performance monitoring
11. Create test documentation with patterns to avoid
12. Set up pre-commit hook to prevent slow tests

## Expected Results

**Before**:
- CI times out after 30 minutes
- No clear indication which test is hanging
- Tests interfere with each other

**After**:
- CI completes in 5-10 minutes
- Fast failure with clear error messages
- Tests run in isolation with proper cleanup
- Easy to identify and fix slow tests

## Monitoring

Add to CI workflow:
```yaml
- name: Run tests with timing
  run: |
    npm run test:ci -- --reporter=verbose --reporter=json --outputFile=test-results.json
    
- name: Check for slow tests
  run: |
    node -e "
      const results = require('./test-results.json');
      const slow = results.testResults
        .filter(t => t.duration > 2000)
        .map(t => ({ file: t.name, duration: t.duration }));
      if (slow.length) {
        console.warn('⚠️ Slow tests detected:', slow);
      }
    "
```

## Documentation

Create these guides:
1. `docs/TESTING_BEST_PRACTICES.md` - Patterns to use/avoid
2. `docs/TEST_DEBUGGING.md` - How to debug hanging tests
3. `docs/TEST_ARCHITECTURE.md` - How tests are organized

---

**Last Updated**: 2025-11-15  
**Estimated Implementation Time**: 2-4 hours  
**Priority**: CRITICAL - Blocking all PR merges
