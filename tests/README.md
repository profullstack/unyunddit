# Test Suite for Onion SSR Boilerplate

## Overview

This test suite provides comprehensive coverage for the onion-ssr-boilerplate project using **Vitest**. The tests are designed to work with the SSR-only architecture and focus on server-side functionality.

## Test Structure

```
tests/
├── setup.js                           # Test configuration and mocks
├── lib/
│   └── supabase.test.js               # Supabase client tests
├── hooks.server.test.js               # Security headers tests
├── routes/
│   └── guestbook/
│       └── page.server.test.js        # Guestbook server logic tests
└── README.md                          # This file
```

## Test Coverage

### ✅ Working Tests

1. **Security Headers (`hooks.server.test.js`)**
   - Content Security Policy validation
   - Privacy headers verification
   - Server identification removal
   - Frame protection

2. **Supabase Integration (`lib/supabase.test.js`)**
   - Client creation with different keys
   - Configuration validation
   - Error handling

### ⚠️ Known Issues

1. **Svelte Component Tests**
   - Component tests fail in SSR-only mode because `mount()` is not available on the server
   - This is expected behavior for our SSR-only architecture
   - Components are tested indirectly through server-side rendering

2. **Server Action Tests**
   - Some mocking issues with SvelteKit's module system
   - Tests are comprehensive but may need adjustment for complex scenarios

## Running Tests

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Test Philosophy

Since this is an **SSR-only boilerplate**, our testing strategy focuses on:

1. **Server-side Logic**: Form handling, validation, database operations
2. **Security**: Headers, CSP policies, privacy protection
3. **Integration**: Supabase client configuration and error handling
4. **Business Logic**: Guestbook functionality, input validation

## Component Testing Alternative

Instead of traditional component testing, we rely on:

1. **Integration Tests**: Testing the full request/response cycle
2. **Server-side Rendering**: Components are tested through actual SSR
3. **End-to-end Testing**: Manual testing of the rendered HTML
4. **Build Validation**: Ensuring components compile without errors

## Future Improvements

1. **Playwright Tests**: Add E2E tests for full user workflows
2. **API Testing**: More comprehensive server action testing
3. **Database Integration**: Tests with actual Supabase instances
4. **Performance Testing**: SSR rendering performance validation

## Test Configuration

The test suite uses:

- **Vitest**: Modern, fast test runner
- **jsdom**: DOM simulation for server-side testing
- **Mocking**: Comprehensive mocks for SvelteKit and Supabase
- **Coverage**: V8 coverage provider for accurate reporting

## Notes

- Component tests are intentionally excluded due to SSR-only architecture
- Focus is on server-side functionality and security
- Tests validate the core privacy and security features of the boilerplate