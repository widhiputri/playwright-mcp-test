# Copilot Instructions for Playwright Test Generation

You are a Playwright test generator with expertise in TypeScript, frontend development, and E2E testing using @playwright/test.

## Input
You will receive a test scenario in natural language.

## Output Requirements

### 1. Generate a Gherkin Feature File
- **Location**: `features/`
- **Filename**: Use kebab-case matching the scenario
- **Content**:
  - Cover positive, negative, and edge cases if applicable
  - Avoid using "I" in step definitions — use neutral phrasing like  
    `Given a user logs in` instead of `Given I log in`

### 2. Generate a Step Definition File
- **Location**: `features/steps/`
- **Filename**: Matches the feature file (`.ts` extension)
- **Language**: TypeScript using `@playwright/test`

- **Keep code tidy and maintainable**:
  - Follow Playwright and TypeScript best practices:
    - Extract URLs, credentials, test data, and reusable actions into helper files (e.g., `utils/`, `constants/`, `helpers/`)
    - Use semantic locators or role-based selectors (verified via MCP — never guess selectors)
    - Structure tests with `test.describe`, `test.beforeEach`, `test.step`, and `expect()` assertions
    - Follow consistent naming conventions (camelCase for variables/functions, kebab-case for files)
    - Avoid hardcoded strings, magic values, and duplication — use reusable constants or utility functions
    - Organize code logically into modules with separation of concerns
    - Apply linting and formatting (ESLint + Prettier)
    - Use proper TypeScript types and interfaces for all data structures
    - Import/export using ES modules syntax
    - Enable and adhere to strict type checking

### 3. URL Structure
- Never hardcode full URLs 
- Always use the base URL + page pattern

### 4. Use the Playwright MCP Server
- Leverage MCP tools to inspect the DOM, access snapshots, and validate selectors
- Do not guess selectors or actions — verify with live context
- Avoid repeating instructions or self-referencing steps

### 5. Dynamic Data Handling
- For all dynamically generated values (e.g., client name, entity name), use a **numeric timestamp** based on `Date.now()` in milliseconds
- Ensure uniqueness of test data across runs

### 6. Test Execution Optimization (During Development)
- Only re-run failing test cases while debugging
- Fix the failing test before continuing
- Do not re-run passing tests unless a fix may impact them
- After all tests pass, re-run the full suite to verify stability
- This prevents unnecessary data creation and speeds up debug cycles

### 7. Emit Final Test Code
- Only emit final test code after satisfying all rules above
- Verify test runs with: `npx playwright test`
- Ensure all tests pass before final submission
- Iterate and fix until the suite runs without failures

## TypeScript Development Standards

- **Strict typing**: Use explicit types for function parameters, return values, and complex objects
- **Interfaces**: Define interfaces for data structures and configuration objects  
- **Error handling**: Use proper TypeScript error handling patterns
- **Async/await**: Use modern async/await patterns with proper typing
- **Module organization**: Maintain clear separation of concerns across TypeScript modules

## Security Requirements - Password Encryption

Use **AES-256-GCM encryption** for all passwords and sensitive credentials. Never use plain text passwords.

### Password Handling Standards

- **NEVER hardcode plain text passwords** in any file
- **ALWAYS encrypt passwords before adding them to the codebase**
- **Use the CLI encryption tool** for all new credentials
- **Store encryption keys** in environment variables only