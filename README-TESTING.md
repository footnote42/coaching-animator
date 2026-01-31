# Testing Guide for Coaching Animator

## Overview

This project uses Playwright MCP with Windsurf for automated user acceptance testing. The test suite covers all 9 user stories and provides comprehensive validation of functionality, usability, and performance.

## Test Structure

```
test-cases/
├── coaching-animator-uat.yml    # Full UAT suite (all phases)
├── smoke-tests.yml              # Quick health checks
├── environments/
│   ├── dev.yml                  # Development environment config
│   ├── staging.yml              # Staging environment config
│   └── production.yml           # Production environment config
└── helpers/
    └── common-steps.yml         # Reusable test steps
```

## Quick Start

### 1. Run Full UAT Suite
```bash
/run-yaml-test file:test-cases/coaching-animator-uat.yml env:dev
```

### 2. Run Smoke Tests
```bash
/run-yaml-test file:test-cases/smoke-tests.yml env:dev
```

### 3. Run Specific Phase
```bash
/run-yaml-test file:test-cases/coaching-animator-uat.yml env:dev phase:"Phase 1"
```

## Test Phases

The UAT suite is organized into 10 phases:

1. **Landing Page & First Impressions** - UX and conversion
2. **User Registration & Login** - Authentication flow
3. **Animation Creation Workflow** - Core tool functionality
4. **Cloud Storage & Gallery** - Save and personal gallery
5. **Public Gallery & Social Features** - Community features
6. **Guest Mode & Limitations** - Conversion optimization
7. **Admin Dashboard & Moderation** - Content management
8. **Mobile Experience** - Responsive design
9. **Performance & Accessibility** - Compliance and performance
10. **Cross-Browser Testing** - Compatibility validation

## Environment Configuration

### Development (dev.yml)
- URL: `http://localhost:3000`
- Browser: Chrome (visible)
- Full debugging enabled
- All test data available

### Staging (staging.yml)
- URL: `https://staging.coaching-animator.com`
- Browser: Chrome (headless)
- Performance thresholds enforced
- Staging test accounts

### Production (production.yml)
- URL: `https://coaching-animator.com`
- Browser: Chrome (headless)
- Minimal output
- Real test accounts

## Test Data

### Users
- **Admin**: Full administrative access
- **Coach**: Standard registered user
- **Guest**: Unauthenticated user

### Animations
- **Basic**: Simple 3-frame lineout play
- **Complex**: Multi-phase backline strategy

## Running Tests

### Prerequisites
1. Ensure application is running on target environment
2. Playwright MCP is installed in Windsurf
3. Test data is available (for staging/production)

### Commands

#### Full Test Suite
```bash
/run-yaml-test file:test-cases/coaching-animator-uat.yml env:dev
```

#### Quick Health Check
```bash
/run-yaml-test file:test-cases/smoke-tests.yml env:dev
```

#### Mobile Testing
```bash
/run-yaml-test file:test-cases/coaching-animator-uat.yml env:dev viewport:375x812
```

#### Cross-Browser Testing
```bash
/run-yaml-test file:test-cases/coaching-animator-uat.yml env:dev browser:firefox
```

## Test Results

Results are saved to:
- **Screenshots**: `./test-results/screenshots/`
- **Traces**: `./test-results/traces/`
- **Videos**: `./test-results/videos/`
- **HTML Reports**: `./test-results/html/`

## Performance Benchmarks

| Metric | Target | Dev | Staging | Production |
|--------|--------|-----|---------|------------|
| Page Load | <3s | ✓ | <2.5s | <2s |
| Animation Render | <1s | ✓ | <800ms | <600ms |
| API Response | <2s | ✓ | <1.5s | <1s |
| Memory Usage | <512MB | ✓ | <400MB | <300MB |

## Accessibility Standards

All tests verify WCAG 2.1 AA compliance:
- ✅ Color contrast (4.5:1 minimum)
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ ARIA labels

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Start application
        run: npm run dev &
      - name: Run smoke tests
        run: /run-yaml-test file:test-cases/smoke-tests.yml env:dev
```

## Troubleshooting

### Common Issues

1. **Tests fail to find elements**
   - Check if application is running
   - Verify correct environment URL
   - Ensure test data exists

2. **Timeout errors**
   - Increase timeout values in environment config
   - Check network connectivity
   - Verify application performance

3. **Authentication failures**
   - Verify test user credentials
   - Check email verification status
   - Ensure user roles are correct

### Debug Mode
Enable debug mode by setting `headless: false` and `slow_mo: 100` in environment config.

## Best Practices

1. **Run smoke tests first** before full UAT suite
2. **Use development environment** for debugging
3. **Check test results** after each run
4. **Update test data** when application changes
5. **Maintain test documentation** for new features

## Contributing

When adding new features:
1. Update existing tests if needed
2. Add new test phases for major features
3. Update test data configuration
4. Verify cross-browser compatibility
5. Update this README

## Support

For testing issues:
1. Check Playwright MCP documentation
2. Review test logs and traces
3. Verify environment configuration
4. Check application logs for errors
