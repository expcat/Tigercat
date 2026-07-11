import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Keep the two Vite example servers stable across the three browser engines.
  // The full suite is a release gate, so determinism matters more than local fan-out.
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /mobile-touch\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      testIgnore: /mobile-touch\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      testIgnore: /mobile-touch\.spec\.ts/,
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chromium',
      testMatch: /mobile-touch\.spec\.ts/,
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: [
    {
      command: 'pnpm --filter @expcat/tigercat-example-vue3 dev --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    },
    {
      command: 'pnpm --filter @expcat/tigercat-example-react dev --host 127.0.0.1',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
})
