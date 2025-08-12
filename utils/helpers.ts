import { Page, expect } from '@playwright/test';
import { SELECTORS, CREDENTIALS } from './constants';

export class LoginHelper {
  constructor(private page: Page) {}

  async login(email: string = CREDENTIALS.OPERATOR.email, password: string = CREDENTIALS.OPERATOR.password) {
    await this.page.waitForLoadState('networkidle');
    
    // Wait for the page to fully load and detect login form elements
    try {
      // Try to find the email/username input field
      await this.page.waitForSelector('input[name="username"], input[type="email"], textbox', { timeout: 15000 });
    } catch {
      console.log('Login form not found, page might already be logged in');
      return;
    }
    
    // Fill login credentials using role-based selectors (more reliable)
    const emailField = this.page.getByRole('textbox', { name: /email/i }).first();
    const passwordField = this.page.getByRole('textbox', { name: /password/i }).first();
    
    await emailField.fill(email);
    await passwordField.fill(password);
    
    // Click login button
    await this.page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation after login
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000); // Give extra time for redirects
  }

  async verifyLoggedIn() {
    // Wait for dashboard or any post-login indicator
    await expect(this.page).not.toHaveURL(/login/);
    await expect(this.page).not.toHaveURL(/auth/);
  }
}

export class NavigationHelper {
  constructor(private page: Page) {}

  async openSidebar() {
    // First, check if we can see the menu unfold button (sidebar closed)
    try {
      await this.page.getByRole('img', { name: 'menu-unfold' }).click({ timeout: 3000 });
      // Wait a moment for the sidebar to animate open
      await this.page.waitForTimeout(1000);
    } catch {
      console.log('Sidebar already open or toggle not needed');
    }
  }

  async navigateToAccountManagement() {
    await this.openSidebar();
    
    // Wait for and click the Account Management menu item
    await this.page.getByRole('menuitem', { name: /idcard Account Management/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToEntitiesTab() {
    // Click on the Entities tab within the Account Management page
    await this.page.getByRole('tab', { name: 'Entities' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}

export class ClientHelper {
  constructor(private page: Page) {}

  generateClientName(): string {
    const timestamp = Date.now();
    return `Testing-PW-Clients-${timestamp}`;
  }

  async checkClientExists(clientName: string): Promise<boolean> {
    try {
      const table = await this.page.locator('table');
      await table.waitFor({ timeout: 5000 });
      
      const clientRow = this.page.locator(`table tr:has-text("${clientName}")`);
      return await clientRow.count() > 0;
    } catch {
      return false;
    }
  }

  async createClient(name: string, type: string = 'Intermediary') {
    // First close the sidebar to avoid interference
    try {
      await this.page.getByRole('img', { name: 'menu-fold' }).click({ timeout: 2000 });
      await this.page.waitForTimeout(500);
    } catch {
      console.log('Sidebar already closed');
    }
    
    // Click Add new button
    await this.page.getByRole('button', { name: /Add new/i }).click();
    await this.page.waitForURL(/create/, { timeout: 10000 });
    
    // Fill client name
    await this.page.getByRole('textbox', { name: /client name/i }).fill(name);
    
    // Handle the client type dropdown
    await this.page.locator('.ant-select').click();
    await this.page.getByText(type, { exact: true }).click();
    
    // Fill remarks
    await this.page.getByRole('textbox', { name: /remarks/i }).fill('MCP testing');
    
    // Submit the form
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for success message or redirect back to clients page
    try {
      await this.page.waitForSelector('alert:has-text("Client Added")', { timeout: 10000 });
    } catch {
      // Check if we're back on the clients page
      await this.page.waitForURL(/clients$/, { timeout: 5000 });
    }
  }

  async verifyClientInTable(clientName: string) {
    const clientRow = this.page.locator(`table tr:has-text("${clientName}")`);
    await expect(clientRow).toBeVisible();
  }
}

export class EntityHelper {
  constructor(private page: Page) {}

  generateEntityName(): string {
    const timestamp = Date.now();
    return `Testing-PW-Entity-${timestamp}`;
  }

  async createEntity(name: string, clientName: string, type: string = 'Corporate', remarks: string = 'MCP testing') {
    // Click Add new button
    await this.page.getByRole('button', { name: /Add new/i }).click();
    await this.page.waitForURL(/create/, { timeout: 10000 });
    
    // Fill entity name
    await this.page.getByRole('textbox', { name: /entity name/i }).fill(name);
    
    // Select entity type - click first dropdown and wait for options to appear
    await this.page.locator('.ant-select').first().click();
    await this.page.waitForSelector('.ant-select-dropdown:visible');
    await this.page.locator('.ant-select-dropdown:visible').getByText(type, { exact: true }).click();
    
    // Select client - click second dropdown and wait for options
    await this.page.locator('.ant-select').nth(1).click();
    await this.page.waitForSelector('.ant-select-dropdown:visible');
    await this.page.locator('.ant-select-dropdown:visible').getByText(clientName).click();
    
    // Fill remarks
    await this.page.getByRole('textbox', { name: /remarks/i }).fill(remarks);
    
    // Submit the form
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for success message or redirect back to entities page
    try {
      await this.page.waitForSelector('alert:has-text("Entity Added")', { timeout: 10000 });
    } catch {
      // Check if we're back on the entities page
      await this.page.waitForURL(/entities$/, { timeout: 5000 });
    }
  }

  async verifyEntityInTable(entityName: string) {
    const entityRow = this.page.locator(`table tr:has-text("${entityName}")`);
    await expect(entityRow).toBeVisible();
  }

  async verifyEntityStatus(entityName: string, expectedStatus: string = 'Under Review') {
    const entityRow = this.page.locator(`table tr:has-text("${entityName}")`);
    await expect(entityRow).toContainText(expectedStatus);
  }
}

export function generateTimestamp(): string {
  return Date.now().toString();
}
