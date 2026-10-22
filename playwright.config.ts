import { defineConfig, devices } from '@playwright/test'
import { exampleApps } from './e2e/example-helpers'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Use the same built examples across browser engines.
  // `pnpm e2e` is Chromium-only; `pnpm e2e:full` runs every project below.
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    locale: 'zh-CN',
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
  // Playwright waits for each server before starting the next build.
  webServer: exampleApps.map(({ packageName, baseUrl }) => {
    const url = new URL(baseUrl)
    return {
      command: `pnpm --filter ${packageName} build && pnpm --filter ${packageName} preview --host ${url.hostname} --port ${url.port} --strictPort --base ${url.pathname}`,
      url: baseUrl,
      reuseExistingServer: false,
      timeout: 120_000
    }
  })
})
