import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for RaddiBhaav
 * Configured for mobile-first testing (budget Android viewport 375x812)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 375, height: 812 }, // Mobile viewport
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run start -p 3000',
    url: 'http://localhost:3000/en',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
