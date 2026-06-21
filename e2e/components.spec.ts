import { test, expect } from '@playwright/test'

const VUE_URL = 'http://localhost:5173'
const REACT_URL = 'http://localhost:5174'

function demoUrl(baseUrl: string, path: string): string {
  return `${baseUrl}/#/${path}`
}

for (const [framework, baseUrl] of [
  ['Vue', VUE_URL],
  ['React', REACT_URL]
] as const) {
  test.describe(`${framework} — Basic Navigation`, () => {
    test('home page loads', async ({ page }) => {
      await page.goto(baseUrl)
      await expect(page).toHaveTitle(/tigercat/i)
    })

    test('can navigate to button demo', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'button'))
      await expect(page.locator('button').first()).toBeVisible()
    })

    test('can navigate to input demo', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'input'))
      await expect(page.locator('input').first()).toBeVisible()
    })
  })

  test.describe(`${framework} — Form Components`, () => {
    test('button click interaction', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'button'))
      const button = page.locator('button').first()
      await expect(button).toBeEnabled()
      await button.click()
    })

    test('input typing', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'input'))
      const input = page.locator('input').first()
      await input.fill('Hello Tigercat')
      await expect(input).toHaveValue('Hello Tigercat')
    })

    test('checkbox toggle', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'checkbox'))
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.check()
      await expect(checkbox).toBeChecked()
      await checkbox.uncheck()
      await expect(checkbox).not.toBeChecked()
    })

    test('switch toggle', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'switch'))
      const switchEl = page.locator('[role="switch"]').first()
      await switchEl.click()
    })

    test('select dropdown', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'select'))
      await expect(page.locator('[class*="select"]').first()).toBeVisible()
    })
  })

  test.describe(`${framework} — Feedback Components`, () => {
    test('alert renders', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'alert'))
      await expect(page.locator('[role="alert"]').first()).toBeVisible()
    })

    test('modal open and close', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'modal'))
      const trigger = page.getByRole('button', { name: /打开对话框/ }).first()
      await trigger.click()
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
    })

    test('tooltip on hover', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'tooltip'))
      const trigger = page.locator('[data-tooltip-trigger], button').first()
      await trigger.hover()
    })
  })

  test.describe(`${framework} — Data Display`, () => {
    test('table renders with rows', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'table'))
      await expect(page.locator('table').first()).toBeVisible()
      const rows = page.locator('tbody tr')
      await expect(rows.first()).toBeVisible()
    })

    test('tabs switching', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'tabs'))
      const tabs = page.locator('[role="tab"]')
      await expect(tabs.first()).toBeVisible()
      if ((await tabs.count()) > 1) {
        await tabs.nth(1).click()
      }
    })
  })

  test.describe(`${framework} — Navigation`, () => {
    test('menu renders', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'menu'))
      await expect(page.locator('[role="menu"], [role="menubar"], nav').first()).toBeVisible()
    })

    test('breadcrumb renders', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'breadcrumb'))
      await expect(page.locator('nav').first()).toBeVisible()
    })

    test('pagination interaction', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'pagination'))
      await expect(page.locator('nav[aria-label="Pagination"]').first()).toBeVisible()
    })
  })

  test.describe(`${framework} — Charts`, () => {
    test('bar chart renders SVG', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'bar-chart'))
      await expect(page.locator('svg').first()).toBeVisible()
    })

    test('line chart renders SVG', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'line-chart'))
      await expect(page.locator('svg').first()).toBeVisible()
    })

    test('pie chart renders SVG', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'pie-chart'))
      await expect(page.locator('svg').first()).toBeVisible()
    })
  })

  test.describe(`${framework} — Layout`, () => {
    test('grid renders', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'grid'))
      await expect(page.locator('[class*="grid"], [class*="row"]').first()).toBeVisible()
    })

    test('divider renders', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'divider'))
      await expect(page.locator('[role="separator"], hr, [class*="divider"]').first()).toBeVisible()
    })
  })
}
