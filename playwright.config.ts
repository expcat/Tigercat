import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}',
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
      use: { ...devices['Desktop Chrome'] }
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
