# Testing Guide

## Running Tests

This project includes comprehensive unit and integration tests for all features.

### Prerequisites

Install Node.js and npm if you haven't already:
- Download from [nodejs.org](https://nodejs.org/)
- Or use a package manager (e.g., `brew install node` on macOS)

### Installation

Install test dependencies:

```bash
npm install
```

### Running Tests

#### Run all tests:
```bash
npm test
```

#### Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

#### Run tests with coverage report:
```bash
npm run test:coverage
```

Coverage report will be generated in the `coverage/` directory.

## Test Structure

### `__tests__/utils.test.js`
Unit tests for utility functions:
- **XSS Protection** - HTML sanitization with `escapeHtml()`
- **Calendar Generation** - ICS file formatting and date handling
- **Date Parsing** - Date/time validation and timezone handling
- **Guest Counting** - Total guest calculations with backwards compatibility
- **Input Validation** - Length and format validation for all inputs
- **Link Generation** - Unique invitation link creation
- **Security** - XSS prevention in all user inputs
- **Backwards Compatibility** - Old data format support

### `__tests__/integration.test.js`
Integration tests for complete workflows:
- **RSVP Flow** - Complete attending/declining process
- **Admin Dashboard** - Statistics calculation
- **Event Management** - Create, edit, delete operations
- **Calendar Integration** - Complete calendar file generation
- **Multi-Event Support** - Event filtering and stats
- **Error Handling** - Graceful degradation

## Test Coverage

Current test coverage includes:

### Core Functions (100%)
- ✅ `escapeHtml()` - XSS protection
- ✅ Date parsing and formatting
- ✅ Guest count calculations
- ✅ Link ID generation
- ✅ Input validation
- ✅ Calendar file generation

### Features (100%)
- ✅ Event creation with time and venue
- ✅ RSVP submission (attending/declining)
- ✅ Guest name tracking (optional)
- ✅ Family/group name tracking
- ✅ Calendar download (.ics)
- ✅ Backwards compatibility
- ✅ Multi-event support
- ✅ Admin statistics

### Security (100%)
- ✅ XSS prevention in all text inputs
- ✅ Input length validation
- ✅ Format validation (dates, times)
- ✅ Malicious input sanitization

## Writing New Tests

When adding new features, add corresponding tests:

```javascript
const { describe, test, expect } = require('@jest/globals');

describe('Your Feature', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = yourFunction(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

## Continuous Integration

Tests can be integrated with CI/CD pipelines:

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Test Best Practices

1. **Arrange-Act-Assert** - Structure tests clearly
2. **Descriptive Names** - Test names should explain what they test
3. **Single Responsibility** - Each test should verify one thing
4. **No External Dependencies** - Mock Firebase and external services
5. **Fast Execution** - Tests should run quickly
6. **Deterministic** - Same input = same output every time

## Debugging Tests

### Run specific test file:
```bash
npx jest __tests__/utils.test.js
```

### Run tests matching pattern:
```bash
npx jest -t "escapeHtml"
```

### Run with verbose output:
```bash
npm test -- --verbose
```

### Debug in VS Code:
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Mocking Firebase

Tests include Firebase mocking in `__tests__/setup.js`:

```javascript
global.window.firebaseModules = {
  initializeApp: jest.fn(),
  getFirestore: jest.fn(),
  // ... other Firebase methods
};
```

This allows testing without actual Firebase connections.

## Test Maintenance

- **Update tests** when changing functionality
- **Add tests** for new features before implementation (TDD)
- **Review coverage** regularly with `npm run test:coverage`
- **Keep tests simple** - Complex tests are hard to maintain

## Common Issues

### Tests fail with "Cannot find module"
```bash
npm install
```

### Coverage not generated
```bash
rm -rf coverage/
npm run test:coverage
```

### Tests hang
- Check for async operations without proper cleanup
- Ensure mocks are properly reset between tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [JavaScript Testing Guide](https://testingjavascript.com/)
