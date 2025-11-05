# MyPlanPage Testing Documentation

## Overview
This document provides comprehensive information about the testing infrastructure for the MyPlanPage component and the overall Felony Fitness application testing strategy.

## Testing Framework
- **Testing Library**: Vitest with React Testing Library
- **Test Environment**: jsdom (browser simulation)
- **Coverage Tool**: V8 coverage provider
- **Assertion Library**: @testing-library/jest-dom

## File Structure
```
tests/
├── setup.js                    # Global test configuration
├── pages/
│   └── MyPlanPage.test.jsx     # MyPlanPage component tests
├── reports/                    # Generated test reports
│   ├── test-results.json
│   └── test-results.html
└── coverage/                   # Generated coverage reports
    ├── index.html
    └── lcov.info
```

## Running Tests

### Basic Test Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/pages/MyPlanPage.test.jsx

# Run tests in watch mode
npm test -- --watch

# Run tests with verbose output
npm test -- --reporter=verbose
```

### Advanced Test Commands
```bash
# Run tests with HTML coverage report
npm test -- --coverage --reporter=html

# Run tests with JSON output for CI/CD
npm test -- --reporter=json --outputFile=./tests/reports/test-results.json

# Run tests with specific timeout
npm test -- --testTimeout=15000

# Run tests matching pattern
npm test -- --testNamePattern="User ID"
```

## Test Categories

### 1. Component Rendering Tests
- Initial component mount and display
- Loading states and transitions
- Error handling and fallback UI
- Responsive design behavior

### 2. Data Loading Tests
- Supabase integration testing
- Mock data scenarios
- Error handling for failed requests
- Loading state management

### 3. User Interaction Tests
- Button clicks and form submissions
- Modal opening and closing
- User ID visibility toggle
- Copy to clipboard functionality

### 4. Theme Management Tests
- Theme switching functionality
- Context integration testing
- Settings modal behavior
- Theme persistence

### 5. Accessibility Tests
- ARIA label validation
- Keyboard navigation
- Screen reader compatibility
- Focus management

### 6. Integration Tests
- Complete user workflows
- Component interaction chains
- Context provider integration
- End-to-end scenarios

## Mock Strategy

### Mocked Dependencies
```javascript
// AuthContext - User authentication state
vi.mock('../AuthContext.jsx', () => ({
  useAuth: vi.fn()
}));

// ThemeContext - Application theme management
vi.mock('../context/ThemeContext.jsx', () => ({
  useTheme: vi.fn()
}));

// Supabase Client - Database operations
vi.mock('../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// React Modal - Modal component
vi.mock('react-modal', () => ({
  default: ({ isOpen, children, onRequestClose }) => 
    isOpen ? <div data-testid="modal">{children}</div> : null
}));
```

### Mock Data Factory
The `mockDataFactory` provides consistent test data:
```javascript
const mockUser = mockDataFactory.createMockUser();
const mockProfile = mockDataFactory.createMockUserProfile({ plan_type: 2 });
const mockPlans = mockDataFactory.createMockPlans();
```

## Test Configuration

### Coverage Thresholds
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### Timeout Settings
- Test Timeout: 10 seconds
- Hook Timeout: 10 seconds

### Environment Variables
```javascript
process.env.NODE_ENV = 'test'
```

## Writing New Tests

### Test Structure Template
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup common mocks and state
    setupMocks();
  });

  it('should describe expected behavior', async () => {
    // Arrange - Setup test conditions
    const mockData = mockDataFactory.createMockUser();
    
    // Act - Perform the action
    render(<MyPlanPage />);
    await user.click(screen.getByRole('button'));
    
    // Assert - Verify the outcome
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Best Practices
1. **Descriptive Test Names**: Use clear, behavior-focused descriptions
2. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
3. **Mock Isolation**: Mock external dependencies to ensure test isolation
4. **Async Handling**: Use `waitFor` for asynchronous operations
5. **User-Centric**: Test from the user's perspective, not implementation details
6. **Edge Cases**: Include error scenarios and boundary conditions

### Common Testing Patterns

#### Testing User Interactions
```javascript
it('should toggle user ID visibility when clicked', async () => {
  setupMocks();
  render(<MyPlanPage />);
  
  await user.click(screen.getByTitle('Show User ID'));
  expect(screen.getByText('user-id-string')).toBeInTheDocument();
});
```

#### Testing Async Operations
```javascript
it('should load plans from database', async () => {
  setupMocks();
  render(<MyPlanPage />);
  
  await waitFor(() => {
    expect(screen.getByText('$100 LIFETIME')).toBeInTheDocument();
  });
});
```

#### Testing Error States
```javascript
it('should handle database errors gracefully', async () => {
  setupMocks({ shouldFail: true });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  render(<MyPlanPage />);
  
  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith('Error loading data:', expect.any(Error));
  });
  
  consoleSpy.mockRestore();
});
```

## Continuous Integration

### GitHub Actions Configuration
```yaml
- name: Run Tests
  run: npm test -- --coverage --reporter=json

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./tests/coverage/lcov.info
```

### Quality Gates
- All tests must pass
- Coverage must meet threshold (80%)
- No console errors during testing
- Accessibility tests must pass

## Debugging Tests

### Common Issues
1. **Async Race Conditions**: Use `waitFor` for async operations
2. **Mock Setup**: Ensure mocks are properly configured before render
3. **Cleanup**: Each test should start with clean state
4. **Context Providers**: Wrap components in necessary providers

### Debug Commands
```bash
# Run tests with debug output
npm test -- --reporter=verbose --logHeapUsage

# Run single test with full output
npm test -- --testNamePattern="specific test" --verbose

# Run tests with DOM debugging
npm test -- --debug
```

## Maintenance

### Regular Tasks
1. Update test data when database schema changes
2. Review and update mock implementations
3. Ensure coverage thresholds are maintained
4. Update test documentation

### When to Run Tests
- Before committing code changes
- During pull request reviews
- As part of CI/CD pipeline
- When modifying component behavior
- When updating dependencies

## Performance Considerations

### Test Optimization
- Use `vi.clearAllMocks()` between tests for isolation
- Avoid unnecessary DOM queries
- Mock heavy dependencies
- Use focused tests with `it.only` during development

### Memory Management
- Cleanup after each test with `afterEach`
- Avoid memory leaks in async operations
- Clear timers and intervals in test cleanup

## Future Enhancements

### Planned Improvements
1. Visual regression testing with Percy or Chromatic
2. E2E testing with Playwright
3. Performance testing with Lighthouse CI
4. API contract testing with Pact
5. Snapshot testing for component structure

### Test Coverage Goals
- Increase to 90% coverage across all metrics
- Add browser compatibility testing
- Implement mutation testing for quality assurance
- Add load testing for performance validation