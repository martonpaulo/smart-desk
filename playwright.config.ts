import { defineConfig, devices } from '@playwright/test';

const TEST_BASE_URL = 'http://127.0.0.1:3000';
const PLAYWRIGHT_WEB_SERVER_COMMAND =
  'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test-key NEXT_PUBLIC_POWERSYNC_AUTH_MODE=development-token NEXT_PUBLIC_POWERSYNC_TOKEN=test-token NEXT_PUBLIC_POWERSYNC_URL=http://127.0.0.1:8080 pnpm dev';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: TEST_BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: PLAYWRIGHT_WEB_SERVER_COMMAND,
    url: TEST_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
