import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { LoginHelper, NavigationHelper, ClientHelper, EntityHelper, generateTimestamp } from '../../utils/helpers';
import { URLS, TEST_DATA } from '../../utils/constants';

// Global variables to store test data across steps
let clientName: string;
let entityName: string;
let loginHelper: LoginHelper;
let navigationHelper: NavigationHelper;
let clientHelper: ClientHelper;
let entityHelper: EntityHelper;

Given('a user navigates to the application', async function () {
  const page: Page = (this as any).page;
  
  // Initialize helpers
  loginHelper = new LoginHelper(page);
  navigationHelper = new NavigationHelper(page);
  clientHelper = new ClientHelper(page);
  entityHelper = new EntityHelper(page);
  
  await page.goto(`${URLS.DEV_BASE_URL}`);
  await page.waitForLoadState('networkidle');
});

When('the user logs in as an operator', async function () {
  await loginHelper.login();
  await loginHelper.verifyLoggedIn();
});

When('the user opens the sidebar menu', async function () {
  await navigationHelper.openSidebar();
});

When('the user accesses Account Management under the Clients tab', async function () {
  await navigationHelper.navigateToAccountManagement();
});

When('the user generates a unique client name with timestamp', async function () {
  clientName = clientHelper.generateClientName();
  console.log(`Generated client name: ${clientName}`);
});

When('the user checks if the client already exists in the client table', async function () {
  const exists = await clientHelper.checkClientExists(clientName);
  console.log(`Client ${clientName} exists: ${exists}`);
});

When('the client does not exist', async function () {
  const exists = await clientHelper.checkClientExists(clientName);
  expect(exists).toBeFalsy();
});

Then('the user creates a new client with Intermediary type', async function () {
  await clientHelper.createClient(clientName, TEST_DATA.CLIENT_TYPE);
});

Then('the user verifies the newly created client appears in the client table', async function () {
  await clientHelper.verifyClientInTable(clientName);
});

When('the user switches to the Entities tab', async function () {
  await navigationHelper.navigateToEntitiesTab();
});

When('the user creates a new entity with Corporate type', async function () {
  entityName = entityHelper.generateEntityName();
  console.log(`Generated entity name: ${entityName}`);
});

When('the user fills all mandatory fields and submits the entity', async function () {
  await entityHelper.createEntity(
    entityName,
    clientName,
    TEST_DATA.ENTITY_TYPE,
    TEST_DATA.ENTITY_REMARKS
  );
});

Then('the user verifies the entity is successfully saved', async function () {
  const page: Page = (this as any).page;
  
  // Wait for success message or redirect
  await page.waitForLoadState('networkidle');
  
  // Check for success alert that appears after entity creation
  try {
    const successAlert = page.locator('alert:has-text("Entity Added"), .ant-notification-notice:has-text("Entity Added")');
    await expect(successAlert).toBeVisible({ timeout: 10000 });
  } catch {
    // If no success message, check that we're redirected back to entities list
    await expect(page).toHaveURL(/entities$/);
    
    // Also check that there are no error messages
    const errorElements = await page.locator('.ant-notification-notice-error, .error-message, alert[role="alert"]:has-text("error")').count();
    expect(errorElements).toBe(0);
  }
});

Then('the user verifies the entity appears in the entity table', async function () {
  await entityHelper.verifyEntityInTable(entityName);
});

Then('the user verifies the entity status is under_review', async function () {
  await entityHelper.verifyEntityStatus(entityName, 'Under Review');
});

// Negative test steps
When('the user attempts to create a client with empty name', async function () {
  const page: Page = (this as any).page;
  
  // Close sidebar first to avoid interference
  try {
    await page.getByRole('img', { name: 'menu-fold' }).click({ timeout: 2000 });
    await page.waitForTimeout(500);
  } catch {
    console.log('Sidebar already closed');
  }
  
  await page.getByRole('button', { name: /Add new/i }).click();
  await page.waitForURL(/create/, { timeout: 10000 });
  
  // Leave name field empty and try to submit
  await page.getByRole('button', { name: 'Submit' }).click();
});

Then('the user should see validation errors', async function () {
  const page: Page = (this as any).page;
  
  // Check for validation error messages - use first() to avoid strict mode violation
  const validationError = page.locator('.ant-form-item-explain-error, .error-message, .field-error').first();
  await expect(validationError).toBeVisible();
  await expect(validationError).toContainText('required');
});

Then('the client should not be created', async function () {
  const page: Page = (this as any).page;
  
  // Verify we're still on the creation form (not redirected)
  const nameInput = page.getByRole('textbox', { name: /client name/i });
  await expect(nameInput).toBeVisible();
});

// Edge case steps
When('the user attempts to create an entity without selecting a client', async function () {
  const page: Page = (this as any).page;
  
  await page.getByRole('button', { name: /Add new/i }).click();
  await page.waitForURL(/create/, { timeout: 10000 });
  
  // Fill only name field, leave client dropdown empty
  const testEntityName = `Test-Entity-${generateTimestamp()}`;
  await page.getByRole('textbox', { name: /entity name/i }).fill(testEntityName);
  
  // Select entity type but not client
  await page.locator('.ant-select').first().click();
  await page.waitForSelector('.ant-select-dropdown:visible');
  await page.locator('.ant-select-dropdown:visible').getByText('Corporate', { exact: true }).click();
  
  // Try to submit without selecting client
  await page.getByRole('button', { name: 'Submit' }).click();
});

Then('the user should see client selection validation error', async function () {
  const page: Page = (this as any).page;
  
  // Check for client-specific validation error
  const clientValidationError = page.locator('.ant-form-item-explain-error, .error-message').first();
  await expect(clientValidationError).toBeVisible();
  await expect(clientValidationError).toContainText('required');
});

Then('the entity should not be created', async function () {
  const page: Page = (this as any).page;
  
  // Verify we're still on the creation form
  const nameInput = page.getByRole('textbox', { name: /entity name/i });
  await expect(nameInput).toBeVisible();
  
  // Also check that the URL is still the create form
  await expect(page).toHaveURL(/create/);
});
