# GitHub Copilot Custom Instructions - Felony Fitness App

## Project Context
This is a **fitness training and nutrition management platform** built with React, Vite, and Supabase. The application serves both trainers and clients with role-based features for workout programming, nutrition tracking, messaging, and progress monitoring.

---

## 🎯 Code Quality Standards

### Zero Tolerance Policy
- **ESLint Errors**: All ESLint errors MUST be resolved before PR approval. No exceptions.
- **Type Safety**: TypeScript errors must be fixed, not suppressed with `@ts-ignore`.
- **Console Logs**: No `console.log()` statements in production code (use proper logging utilities).
- **Unused Code**: Flag ALL unused variables, imports, functions, and parameters.

### Critical Review Areas
1. **Security vulnerabilities** (especially Supabase RLS policies, auth flows)
2. **Performance bottlenecks** (unnecessary re-renders, large bundle sizes)
3. **Accessibility issues** (WCAG 2.1 AA compliance)
4. **Memory leaks** (useEffect cleanup, event listener removal)
5. **Error handling** (try-catch blocks, fallback states)

---

## 📚 Documentation Requirements

### MANDATORY Documentation
Every PR must include documentation for:

1. **Functions & Components**:
   - JSDoc comments with `@description`, `@param`, `@returns`, `@example`
   - Explain the "why", not just the "what"
   - Document edge cases and limitations

2. **Complex Logic**:
   - Inline comments for non-obvious code
   - Algorithm explanations with time/space complexity
   - Business logic rationale

3. **API Changes**:
   - Update README.md if public APIs change
   - Document breaking changes prominently
   - Migration guides for schema changes

4. **State Management**:
   - Document state shape and purpose
   - Explain state update patterns
   - Note any derived state

### Example Standard:
```javascript
/**
 * Calculate user's daily macro targets based on goals and activity level
 * 
 * @description Uses the Mifflin-St Jeor equation for BMR calculation,
 * then applies activity multiplier and goal-specific adjustments.
 * 
 * @param {Object} user - User profile data
 * @param {number} user.weight - Weight in pounds
 * @param {number} user.height - Height in inches
 * @param {number} user.age - Age in years
 * @param {string} user.goal - 'cut' | 'maintain' | 'bulk'
 * 
 * @returns {Object} Daily macro targets in grams
 * @returns {number} return.protein - Protein target (g)
 * @returns {number} return.carbs - Carbohydrate target (g)
 * @returns {number} return.fats - Fat target (g)
 * @returns {number} return.calories - Total calorie target
 * 
 * @example
 * const macros = calculateMacros({
 *   weight: 180,
 *   height: 72,
 *   age: 30,
 *   goal: 'cut'
 * });
 * // Returns: { protein: 180, carbs: 200, fats: 60, calories: 2040 }
 */
```

---

## 🏗️ Architecture & Patterns

### Tech Stack
- **Frontend**: React 18, Vite 7, React Router 6
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: CSS Modules, CSS Variables for theming
- **State**: React Context + hooks (no Redux)
- **Testing**: Vitest, React Testing Library

### Required Patterns

#### 1. Component Structure
```javascript
// Standard order:
// 1. Imports (external, then internal)
// 2. Type definitions / PropTypes
// 3. Component definition
// 4. Hooks (in logical order)
// 5. Event handlers
// 6. Helper functions
// 7. Effects
// 8. Render logic
// 9. Export
```

#### 2. Error Handling
- Always wrap Supabase calls in try-catch
- Provide user-friendly error messages
- Log errors for debugging but don't expose internals
- Use error boundaries for component trees

#### 3. Performance
- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` appropriately
- Lazy load routes and heavy components
- Optimize images (WebP, lazy loading, proper sizing)

#### 4. Supabase Best Practices
- **ALWAYS** verify RLS policies exist for tables
- Use parameterized queries (prevent SQL injection)
- Implement proper error handling for auth states
- Use Edge Functions for complex server logic
- Minimize client-side data fetching (use views/functions)

---

## 🔒 Security Requirements

### Authentication & Authorization
- Verify user authentication before sensitive operations
- Check user roles/permissions at component level
- Never trust client-side role checks alone (RLS is source of truth)
- Implement proper session management

### Data Validation
- Validate ALL user inputs (client AND server side)
- Sanitize data before database operations
- Use Zod or similar for runtime type checking
- Prevent XSS, SQL injection, and CSRF attacks

### Sensitive Data
- No API keys, passwords, or tokens in code
- Use environment variables (`.env.local` for local dev)
- Mask PII in logs and error messages
- Implement proper CORS policies

---

## ⚡ Performance Standards

### Bundle Size
- Main bundle: < 500 KB (gzipped)
- Individual chunks: < 200 KB (gzipped)
- Flag any imports that significantly increase bundle size
- Suggest code splitting opportunities

### React Performance
- Identify unnecessary re-renders
- Suggest memoization where beneficial
- Flag large components (> 300 lines, consider splitting)
- Recommend virtualization for long lists (> 50 items)

### Database Performance
- Use indexes for frequently queried columns
- Avoid N+1 queries (use joins or batch fetching)
- Implement pagination for large datasets
- Cache expensive computations

### Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Performance Score: > 90

---

## 🧪 Testing Standards

### Required Test Coverage
- **New Components**: 80%+ coverage
- **Utilities/Functions**: 90%+ coverage
- **Critical Paths**: 100% coverage (auth, payments, data loss scenarios)

### Test Types
1. **Unit Tests**: All utility functions and hooks
2. **Integration Tests**: Component interactions, API calls
3. **E2E Tests**: Critical user journeys (sign up, create workout, log nutrition)

### Test Quality
- Tests must be deterministic (no flakiness)
- Use proper test descriptions (Given-When-Then)
- Mock external dependencies (Supabase, timers, APIs)
- Test error states and edge cases

---

## 🎨 UI/UX Standards

### Accessibility (WCAG 2.1 AA)
- All interactive elements must be keyboard accessible
- Proper ARIA labels and roles
- Sufficient color contrast (4.5:1 for text)
- Form inputs have associated labels
- Focus indicators visible and clear

### Responsive Design
- Mobile-first approach (320px and up)
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch targets: minimum 44x44px
- Test on iOS and Android devices

### User Experience
- Loading states for all async operations
- Optimistic UI updates where appropriate
- Error messages are helpful and actionable
- Confirmation dialogs for destructive actions
- Keyboard shortcuts for power users

---

## 🚨 Review Focus Areas

### High Priority Issues
1. **Security vulnerabilities**: SQL injection, XSS, auth bypass
2. **Data loss risks**: Missing form validation, unsafe deletions
3. **Performance regressions**: Bundle size increases, slow queries
4. **Breaking changes**: API changes, schema migrations

### Code Smells to Flag
- Functions > 50 lines (suggest refactoring)
- Cyclomatic complexity > 10
- Nested ternaries (> 2 levels)
- Magic numbers (use named constants)
- Duplicate code (DRY violation)
- God components (> 500 lines)

### Naming Conventions
- **Components**: PascalCase (`UserProfile.jsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.js`)
- **Utils**: camelCase (`formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **CSS Classes**: kebab-case BEM (`user-profile__avatar--active`)

---

## 🔄 Git & PR Standards

### Commit Messages
Follow Conventional Commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation only
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Adding/updating tests
- `chore:` Tooling, dependencies

### PR Requirements
1. **Description**: Clear summary of changes and motivation
2. **Screenshots/Videos**: For UI changes
3. **Testing**: Evidence of testing (manual or automated)
4. **Breaking Changes**: Clearly marked and documented
5. **Migration Guide**: For schema changes
6. **Size**: < 500 lines changed (split large PRs)

---

## 🎓 Learning & Improvement

### Suggest Improvements For
- Modern React patterns (hooks over classes)
- ES6+ features over older syntax
- Performance optimizations
- Accessibility enhancements
- Better error handling
- Code reusability (DRY)

### Educational Comments
- Explain WHY a pattern is problematic
- Suggest resources for learning
- Provide code examples of better approaches
- Link to relevant documentation

---

## 📦 Dependencies & Tooling

### Approved Libraries
- **UI Components**: Headless UI, Radix UI (no heavy frameworks)
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns (not moment.js)
- **HTTP Requests**: Supabase client (no axios)
- **Icons**: Lucide React (tree-shakeable)

### Forbidden Patterns
- ❌ jQuery (use modern React)
- ❌ Lodash (use native JS methods)
- ❌ Class components (use functional + hooks)
- ❌ PropTypes (use TypeScript or JSDoc)
- ❌ Default exports (prefer named exports)

---

## 🏋️ Domain-Specific Guidance

### Workout Programming
- Validate exercise form and progression rules
- Ensure proper rest day scheduling
- Check volume/intensity calculations
- Verify muscle group balance

### Nutrition Tracking
- Validate macro calculations (4/4/9 calorie rule)
- Handle missing nutrition data gracefully
- Round to appropriate precision (0.1g)
- Aggregate daily totals accurately

### Trainer-Client Relationships
- Verify proper access control (trainers see only their clients)
- Implement audit logging for sensitive actions
- Handle relationship status changes (active/inactive)
- Protect PII according to HIPAA considerations

### Messaging System
- Implement real-time subscriptions properly
- Handle offline states and reconnection
- Ensure message delivery and read receipts
- Protect against spam and abuse

---

## 🎯 Success Metrics

When reviewing PRs, evaluate against:

1. **Functionality**: Does it work as intended?
2. **Performance**: Is it fast enough?
3. **Security**: Is it safe?
4. **Maintainability**: Can others understand and modify it?
5. **Testability**: Can it be easily tested?
6. **Accessibility**: Can everyone use it?
7. **Documentation**: Is it properly documented?

### Rating System
- **Critical**: Blocks PR (security, data loss, breaking change)
- **Major**: Should be fixed (performance, maintainability)
- **Minor**: Nice to have (style, optimization)
- **Nitpick**: Optional (personal preference, minor style)

---

## 💡 Review Tone

- Be constructive and educational
- Praise good patterns and solutions
- Explain the "why" behind suggestions
- Offer alternatives with trade-offs
- Acknowledge complexity and constraints
- Celebrate improvements and learning

---

**Last Updated**: 2025-11-06  
**Maintained By**: Felony Fitness Development Team
