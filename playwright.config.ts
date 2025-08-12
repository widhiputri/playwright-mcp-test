import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './features',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://ui.am.drax.dev/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: false,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: undefined,
});
