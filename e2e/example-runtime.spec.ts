import { expect, test, type Page } from '@playwright/test'
import { DEMO_NAV_GROUPS } from '../examples/example/shared/app-config'
import { demoUrl, exampleApps } from './example-helpers'

const transientRuntimeFailure =
  /Failed to fetch dynamically imported module|Importing a module script failed|Element is not attached|toBeAttached|toBeVisible|toHaveText|ERR_|NS_ERROR_|Timeout was reached|page\.goto/i

async function inspectRoute(
  page: Page,
  framework: (typeof exampleApps)[number]['framework'],
  baseUrl: string,
  route: string,
  attempt = 0
): Promise<void> {
  try {
    const routeUrl = new URL(demoUrl(baseUrl, route))
    routeUrl.searchParams.set('runtime-sweep', route)
    routeUrl.searchParams.set('runtime-attempt', String(attempt))
    await page.goto(routeUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30_000
    })

    if (framework === 'Vue' && route === 'use-controlled-state') {
      await expect(page.getByText(/Vue 版本请直接使用/)).toBeVisible({ timeout: 30_000 })
      await expect(page.locator('[data-demo-id]')).toHaveCount(0)
      return
    }

    // A fresh document keeps compiler workers, iframes and overlays isolated per route.
    const modules = page.locator(`[data-demo-id^="${route}-"]`)
    await expect(modules.first()).toBeAttached({ timeout: 30_000 })
    const count = await modules.count()
    expect(count, `${framework} ${route} should expose demo modules`).toBeGreaterThan(0)

    for (let index = 0; index < count; index++) {
      const moduleRoot = modules.nth(index)
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
        if (transientRuntimeFailure.test(detail)) {
          throw new Error(detail)
        }
        expect(finalStatus, `${framework} ${route} ${index + 1}: ${detail}`).toBe('ready')
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (attempt >= 2 || !transientRuntimeFailure.test(message)) throw error
    await page.goto('about:blank')
    await inspectRoute(page, framework, baseUrl, route, attempt + 1)
  }
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
