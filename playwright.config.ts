import { defineConfig, devices } from '@playwright/test'

// Visual regression baselines are captured on macOS. CI runs the Linux
// Playwright container, where font/sub-pixel rendering differs enough to fail
// pixel comparisons, so the *-visual specs are skipped in CI and only run
// locally (where the baselines are valid). Functional specs run everywhere.
const desktopTestIgnore = process.env.CI
  ? [/mobile-touch\.spec\.ts/, /-visual\.spec\.ts/]
  : [/mobile-touch\.spec\.ts/]

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  snapshotPathTemplate:
    '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}',
  updateSnapshots: process.env.CI ? 'missing' : 'none',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05
    }
  },
  use: {
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: desktopTestIgnore,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      testIgnore: desktopTestIgnore,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      testIgnore: desktopTestIgnore,
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
      command: 'pnpm --filter @expcat/tigercat-example-vue3 dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    },
    {
      command: 'pnpm --filter @expcat/tigercat-example-react dev',
      port: 5174,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
})
