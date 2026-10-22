import { expect, test, type Page } from '@playwright/test'
import { DEMO_NAV_GROUPS } from '../examples/example/shared/app-config'
import { demoUrl, exampleApps } from './example-helpers'

async function inspectRoute(
  page: Page,
  framework: (typeof exampleApps)[number]['framework'],
  baseUrl: string,
  route: string
): Promise<void> {
  const routeUrl = new URL(demoUrl(baseUrl, route))
  routeUrl.searchParams.set('runtime-sweep', route)
  await page.goto(routeUrl.toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000
  })

  if (framework === 'Vue' && route === 'use-controlled-state') {
    await expect(page.getByText(/React 独有 hook/)).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('[data-demo-id]')).toHaveCount(0)
    return
  }

  // A fresh document keeps compiler workers, iframes and overlays isolated per route.
  // Compile of every DemoBlock file is `pnpm example:compile:check`; the browser
  // job only needs one sandbox per route to prove the iframe actually runs.
  const moduleRoot = page.locator(`[data-demo-id^="${route}-"]`).first()
  await expect(moduleRoot).toBeAttached({ timeout: 30_000 })
  await moduleRoot.scrollIntoViewIfNeeded()
  await expect(moduleRoot.locator('iframe')).toBeVisible({ timeout: 60_000 })
  const status = moduleRoot.locator('[aria-live="polite"]')
  await expect(status).toHaveText(/^(ready|compile-error|runtime-error)$/, {
    timeout: 60_000
  })
  const finalStatus = await status.textContent()
  if (finalStatus !== 'ready') {
    const diagnostics = await moduleRoot.locator('[role="alert"]').allTextContents()
    const detail = diagnostics.join(' | ')
    expect(finalStatus, `${framework} ${route}: ${detail}`).toBe('ready')
  }
  await moduleRoot
    .frameLocator('iframe')
    .locator('body')
    .evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })
    )
  await expect(moduleRoot.locator('[role="alert"]')).toHaveCount(0)
}

for (const { framework, baseUrl } of exampleApps) {
  for (const group of DEMO_NAV_GROUPS) {
    test(`${framework} ${group.key} demo modules compile and run`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'The full module sweep runs once in Chromium')
      test.setTimeout(360_000)

      for (const item of group.items) {
        await test.step(item.key, async () => {
          await inspectRoute(page, framework, baseUrl, item.key)
        })
      }
    })
  }
}
