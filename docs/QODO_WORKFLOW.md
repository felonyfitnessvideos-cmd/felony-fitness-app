# Qodo AI Code Review Workflow

## Overview
Qodo (formerly Codium) provides AI-powered code review to maintain high code quality standards in the Felony Fitness app.

## Installation
1. Install VS Code extension: **Qodo - AI Code Review Platform**
2. Sign in with GitHub account
3. Extension will automatically analyze code as you work

## When to Use Qodo

### 1. Before Committing Code
- Run Qodo review on modified files
- Address critical issues and suggestions
- Improves code quality before it reaches PR stage

### 2. During PR Review
- Qodo automatically reviews pull requests
- Check inline comments and suggestions
- Address high-priority recommendations before merge

### 3. Writing New Features
- Get real-time suggestions as you code
- Catch issues early in development
- Learn best practices from AI feedback

## Integration with Quality Control

### Pre-Commit Workflow
```bash
# 1. Make your changes
git add <files>

# 2. Review with Qodo (in VS Code)
# - Check Qodo panel for suggestions
# - Address critical/high issues
# - Optional: address medium/low issues

# 3. Run local quality checks
npm run lint
npm run test

# 4. Commit (Husky will run pre-commit hooks)
git commit -m "feat: your feature description"
```

### PR Review Workflow
1. **Create PR** - Push branch and open PR on GitHub
2. **Qodo Review** - Wait for Qodo bot to analyze PR
3. **Address Issues** - Fix critical and high-priority items
4. **Team Review** - Human review after Qodo approval
5. **Merge** - Squash and merge when all checks pass

## Qodo Features

### Code Analysis
- **Security vulnerabilities**: SQL injection, XSS, etc.
- **Performance issues**: Unnecessary re-renders, inefficient algorithms
- **Bug detection**: Logic errors, edge cases, type mismatches
- **Best practices**: React patterns, code organization

### Test Suggestions
- **Missing tests**: Identifies untested code paths
- **Test improvements**: Suggests better assertions
- **Coverage gaps**: Highlights low-coverage areas

### Documentation Review
- **JSDoc quality**: Checks completeness and accuracy
- **Comment clarity**: Suggests improvements
- **README updates**: Recommends documentation changes

## Quality Standards with Qodo

### Critical Issues (Must Fix)
- Security vulnerabilities
- Data loss risks
- Breaking changes without migration
- Major performance regressions

### High Priority (Should Fix)
- Logic errors and bugs
- Accessibility violations
- Missing error handling
- Inefficient code patterns

### Medium Priority (Consider Fixing)
- Code style inconsistencies
- Minor performance optimizations
- Documentation improvements
- Refactoring suggestions

### Low Priority (Optional)
- Naming conventions
- Code organization preferences
- Alternative implementations
- Minor optimizations

## Tips for Best Results

1. **Review Regularly**: Don't wait until PR - review as you code
2. **Learn from Suggestions**: Understand the "why" behind recommendations
3. **Customize Settings**: Configure Qodo for project-specific rules
4. **Balance Automation**: Use Qodo + human judgment, not just automation
5. **Track Improvements**: Monitor code quality trends over time

## Integration with Existing Tools

### ESLint
- Qodo complements ESLint with deeper analysis
- ESLint catches syntax/style, Qodo catches logic/security
- Both must pass for commit approval

### Vitest
- Qodo suggests missing tests
- Run tests after implementing Qodo suggestions
- Aim for 80%+ coverage with quality tests

### Husky Pre-commit Hooks
- Qodo review → ESLint → Tests → Commit
- All layers work together for quality

## Metrics to Track

- **Qodo Score**: Aim for 8.0+ on all PRs
- **Critical Issues**: Zero tolerance (must fix before merge)
- **High Issues**: < 3 per PR (preferably zero)
- **Review Time**: Qodo reduces human review time by ~40%

## Common Qodo Recommendations

### For Felony Fitness App
1. **Supabase Security**: RLS policy coverage
2. **React Performance**: Memoization opportunities
3. **Error Handling**: Try-catch completeness
4. **Accessibility**: ARIA labels and keyboard nav
5. **Type Safety**: TypeScript strict mode compliance

---

**Last Updated**: November 14, 2025  
**Maintained By**: Felony Fitness Development Team
