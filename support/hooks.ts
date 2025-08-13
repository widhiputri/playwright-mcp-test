import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

// Set default timeout to 30 seconds
setDefaultTimeout(30000);

let browser: Browser;
let context: BrowserContext;
let page: Page;

BeforeAll(async function () {
  // Launch browser once for all scenarios
  // Use HEADLESS environment variable, default to false for debugging
  const headless = process.env.HEADLESS === 'true' || process.env.CI === 'true';
  browser = await chromium.launch({ headless });
});

Before(async function () {
  // Create new context and page for each scenario
  context = await browser.newContext();
  page = await context.newPage();
  
  // Store page in world context for step definitions
  (this as any).page = page;
  (this as any).context = context;
});

After(async function () {
  // Close context after each scenario
  if (context) {
    await context.close();
  }
});

AfterAll(async function () {
  // Close browser after all scenarios
  if (browser) {
    await browser.close();
  }
});

export { page, context, browser };