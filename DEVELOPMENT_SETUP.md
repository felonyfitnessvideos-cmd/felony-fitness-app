# Felony Fitness App - Development Setup

## Prerequisites
- Node.js 20+
- npm 10+
- Git

## Initial Setup

```bash
# Install dependencies
npm install

# Initialize Husky (Git hooks)
npm run prepare

# Run tests to verify setup
npm run test:run
```

## Pre-Commit Hooks

This project uses Husky and lint-staged to enforce quality standards before commits.

### What Runs on Commit:
1. **ESLint** - Automatically fixes linting issues
2. **Vitest** - Runs tests for changed files
3. **Prettier** - Formats code consistently (JSON, MD, CSS)

### Bypassing Hooks (Emergency Only)
```bash
git commit --no-verify -m "Emergency fix"
```

⚠️ **Note**: CI will still run all checks. Use only for urgent hotfixes.

## Development Workflow

### Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests: `npm run test`
4. Commit (hooks run automatically): `git commit -m "feat: your message"`
5. Push: `git push origin feature/your-feature`

### Testing
```bash
# Watch mode (re-runs on file changes)
npm run test

# Run once
npm run test:run

# With coverage
npm run test:coverage

# Visual UI
npm run test:ui
```

### Linting
```bash
# Check for errors
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Quality Standards

All code must:
- ✅ Pass ESLint with zero errors
- ✅ Have JSDoc documentation
- ✅ Include unit tests for utils/hooks
- ✅ Include integration tests for components
- ✅ Pass all existing tests

## Common Issues

### "Husky not found"
```bash
npm run prepare
```

### "Tests timing out"
Check that no background processes are holding locks.

### "ESLint cache issues"
```bash
rm -rf node_modules/.cache
npm run lint
```

## Resources

- [Quality Control Report](./QUALITY_CONTROL_REPORT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./docs/)
