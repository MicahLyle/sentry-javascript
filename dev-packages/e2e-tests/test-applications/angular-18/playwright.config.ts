import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const testEnv = process.env['TEST_ENV'] || 'production';

if (!testEnv) {
  throw new Error('No test env defined');
}

const angularPort = 8080;
const eventProxyPort = 3031;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 150_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* `next dev` is incredibly buggy with the app dir */
  retries: testEnv === 'development' ? 3 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${angularPort}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'node start-event-proxy.mjs',
      port: eventProxyPort,
    },
    {
      command:
        testEnv === 'development'
          ? `pnpm wait-port ${eventProxyPort} && pnpm preview -p ${angularPort}`
          : `pnpm wait-port ${eventProxyPort} && pnpm preview -p ${angularPort}`,
      port: angularPort,
    },
  ],
};

export default config;
