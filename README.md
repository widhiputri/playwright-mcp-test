# Playwright E2E Testing Framework

A comprehensive end-to-end testing framework built with Playwright and Cucumber BDD, featuring MCP integration and advanced token counting tools for development cost analysis.

## 🚀 Features

### Modern Testing Stack
- **Playwright** - Fast, reliable E2E testing
- **Cucumber BDD** - Human-readable test scenarios
- **TypeScript** - Type-safe test development
- **MCP Integration** - Live DOM inspection and selector validation

### Test Scenarios
Current test coverage includes:
- **User Authentication** - Login workflows and session management
- **Navigation** - Sidebar menus and page routing
- **Data Management** - CRUD operations for entities and records
- **Form Validation** - Input validation and error handling
- **Dynamic Content** - Table interactions and status verification

*See `/features` directory for detailed Gherkin scenarios*

## 📁 Project Structure

```
📦 playwright-mcp-test/
├── 📁 features/                    # BDD Test Scenarios
│   ├── *.feature                   # Gherkin feature files
│   └── 📁 steps/                   # Step definitions
├── 📁 support/                     # Test Configuration
│   └── hooks.ts                    # Setup/teardown hooks
├── 📁 utils/                       # Shared Utilities
│   ├── constants.ts                # App constants & credentials
│   ├── helpers.ts                  # Page interaction helpers
│   └── encryption.ts               # Password encryption utilities
├── 📁 scripts/                     # Development Tools
│   ├── token-counter.ts            # Token analysis tool (TypeScript)
│   ├── full-development-token-counter.ts  # Development cost estimator (TypeScript)
│   ├── universal-token-counter.ps1  # PowerShell alternative
│   └── encrypt-password.ts         # Password encryption utility (TypeScript)
├── 📁 .github/                     # GitHub Configuration
│   └── copilot-instructions.md     # AI coding guidelines
├── TOKEN-COUNTER-USAGE.md          # Token analysis usage guide
├── PASSWORD-ENCRYPTION.md          # Security setup guide
├── .env.example                    # Environment variables template
├── cucumber.js                     # Cucumber configuration
├── playwright.config.ts            # Playwright settings
└── package.json                    # Dependencies & scripts
```

## 🎯 Key Features

### Intelligent Test Design
- **Dynamic Test Data** - Timestamp-based unique identifiers prevent data conflicts
- **Robust Selectors** - Semantic locators with fallback strategies
- **Error Resilience** - Comprehensive exception handling and retry logic
- **Cross-Browser Support** - Tested across multiple browser engines
- **Password Encryption** - AES-256-GCM encrypted credentials for security

### Test Categories
- **@smoke** - Core functionality validation
- **@regression** - Comprehensive feature testing  
- **@negative** - Error handling and validation
- **@edge-case** - Boundary condition testing

### Helper Architecture
- **Modular Design** - Separated concerns with dedicated helper classes
- **Page Object Model** - Clean abstraction of UI interactions
- **Reusable Components** - Shared utilities across test scenarios
- **Type Safety** - Full TypeScript integration for better maintainability

## 🧮 Token Counting Toolkit

Advanced development cost analysis tools included:

### Basic Analysis (`token-counter.ts`)
- INPUT vs OUTPUT token separation
- File-type breakdown with cost estimation
- Deliverable size analysis

### Full Development Analysis (`full-development-token-counter.ts`)
- Complete development effort estimation
- Conversation, debugging, and iteration costs
- 17.6x development multiplier calculations
- ROI and cost comparison reporting

### PowerShell Alternative (`universal-token-counter.ps1`)
- Windows-native implementation
- Same analysis capabilities
- No Node.js dependencies required

## 🚦 Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Run all tests
npm test
```

### Test Execution Options
```bash
# Targeted test runs
npm run test:smoke      # Core functionality
npm run test:regression # Full test suite
npm run test:negative   # Error validation
npm run test:edge      # Edge cases

# Development utilities  
npm run count-tokens    # Analyze current project size
npm run count-full-dev  # Estimate development costs
npm run encrypt-password "your-password"  # Encrypt passwords securely
```

### Token Analysis
```bash
# Basic project analysis
npm run count-tokens

# Full development cost estimation
npm run count-full-dev

# Detailed reporting with JSON export
npm run count-tokens -- --detailed --output report.json
```

## ⚙️ Configuration

### Browser & Test Settings
- **Default Browser**: Chromium (configurable)
- **Execution Mode**: Non-headless for debugging
- **Timeout**: 30s for step definitions
- **Retry Strategy**: Automatic on CI environments
- **Artifacts**: Screenshots on failure, trace on retry

## 🛠️ Development Guide

### Adding New Test Scenarios

1. **Create Feature File** (`features/new-scenario.feature`)
   ```gherkin
   Feature: New Functionality
     Scenario: Test new feature
       Given a user is logged in
       When they perform an action
       Then the result should be visible
   ```

2. **Implement Step Definitions** (`features/steps/new-scenario.ts`)
   ```typescript
   Given('a user is logged in', async function() {
     await this.loginHelper.login();
   });
   ```

3. **Extend Helper Classes** (`utils/helpers.ts`)
   ```typescript
   export class NewFeatureHelper {
     constructor(private page: Page) {}
     // Add methods for new functionality
   }
   ```

### MCP Integration Benefits
- **Live DOM Inspection** - Real-time selector validation
- **Interactive Testing** - Test actions before implementation
- **Selector Optimization** - Find the most reliable locators
- **Debugging Support** - Instant feedback during development

### Best Practices
- ✅ Use semantic selectors (`getByRole`, `getByLabel`)
- ✅ Implement proper wait strategies (`waitForLoadState`)
- ✅ Handle errors gracefully with try-catch blocks
- ✅ Generate unique test data using timestamps
- ✅ Separate concerns with dedicated helper classes
- ✅ Use TypeScript for better code quality

## 🎯 Project Reusability

This framework can be easily adapted for different web applications:

1. **Update Constants** - Modify URLs and credentials in `utils/constants.ts`
2. **Adapt Helpers** - Customize page interaction methods
3. **Create Features** - Write new Gherkin scenarios for your use cases
4. **Configure Playwright** - Adjust browser and test settings

### Copying to New Projects
- See `TOKEN-COUNTER-USAGE.md` for token counting tools
- See `PASSWORD-ENCRYPTION.md` for secure credential setup

## 🔐 Security Features

### Password Encryption
- **AES-256-GCM encryption** for secure credential storage
- **Environment-based keys** for different deployment environments
- **CLI utility** for easy password encryption: `npm run encrypt-password`
- **No plain text passwords** committed to version control

See `PASSWORD-ENCRYPTION.md` for complete setup and usage guide.

## 📊 Results & Reporting

The framework provides comprehensive reporting:
- **Cucumber Reports** - HTML reports with step-by-step details
- **Playwright Reports** - Test execution traces and screenshots
- **Token Analysis** - Development cost and project size metrics
- **Error Logging** - Detailed failure information for debugging

*All tests successfully validate the complete workflow with proper verification of success states and error conditions.*
