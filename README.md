# Playwright Test for Drax Asset Management

This project contains Playwright tests for the Drax Asset Management system, specifically testing client and entity management functionality.

## Test Scenario

The main test scenario covers:
1. Navigate to https://ui.am.drax.dev/
2. Login as operator user (qa-op@hydrax.io with password hXadmin@2018)
3. Open sidebar menu and access Account Management under the Clients tab
4. Generate a unique client name using a timestamp
5. Check if client already exists in the client table
6. Create a new client with Intermediary type
7. Verify the newly created client appears in the client table
8. Switch to the Entities tab
9. Create a new entity with Corporate type
10. Fill all mandatory fields and submit the entity
11. Verify that the entity is successfully saved
12. Verify that the entity appears in the entity table
13. Verify that the entity status is under_review

## Project Structure

```
├── features/
│   ├── client-entity-management.feature  # Gherkin feature file
│   └── steps/
│       └── client-entity-management.ts   # Step definitions
├── support/
│   └── hooks.ts                          # Test hooks (setup/teardown)
├── utils/
│   ├── constants.ts                      # Constants (URLs, credentials, selectors)
│   └── helpers.ts                        # Helper classes for different page actions
├── cucumber.js                           # Cucumber configuration
├── playwright.config.ts                 # Playwright configuration
├── package.json                          # Dependencies and scripts
└── tsconfig.json                         # TypeScript configuration
```

## Key Features

### Dynamic Test Data
- Uses `Date.now()` timestamps to generate unique client and entity names
- Prevents data conflicts across multiple test runs

### Robust Selectors
- Utilizes semantic locators and role-based selectors verified via MCP
- Fallback selectors for better reliability
- Handles dynamic dropdown selections properly

### Test Coverage
- **@smoke**: Main happy path scenario
- **@negative**: Validation testing with empty fields
- **@edge-case**: Testing entity creation without required client selection

### Helper Classes
- `LoginHelper`: Handles authentication
- `NavigationHelper`: Manages sidebar and page navigation
- `ClientHelper`: Client creation and verification
- `EntityHelper`: Entity creation and verification

## Running Tests

```bash
# Install dependencies
npm install

# Install browsers
npm run install:browsers

# Run all tests
npm test

# Run specific test suites
npm run test:smoke      # Main scenario only
npm run test:negative   # Validation tests
npm run test:edge      # Edge case tests
```

## Configuration

### Browser Settings
- Uses Chromium browser
- Runs in non-headless mode for better debugging
- Captures screenshots on failure
- Records traces on retry

### Test Settings
- 30-second timeout for step definitions
- Automatic retry on CI environments
- Detailed logging and error reporting

## Development Notes

### MCP Integration
This project was developed using the Playwright MCP (Model Context Protocol) server to:
- Inspect live DOM structure
- Validate selectors in real-time
- Test interactions before implementing in code

### Best Practices
- Follows TypeScript and Playwright best practices
- Separates concerns with helper classes and utilities
- Uses semantic selectors for better maintainability
- Includes comprehensive error handling

## Test Results

All tests successfully pass:
- ✅ Main client and entity creation workflow
- ✅ Validation error handling for empty fields  
- ✅ Edge case handling for incomplete entity creation

The tests demonstrate successful automation of the complete client and entity management workflow with proper verification of all success states and error conditions.
