import { expect, test } from '@playwright/test'
import { demoUrl, exampleApps, openDemo } from './example-helpers'

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — Example components`, () => {
    test('home page loads', async ({ page }) => {
      await page.goto(baseUrl)
      await expect(page).toHaveTitle(/tigercat/i)
    })

    test('button renders and responds to clicks', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'button', 'button-02')
      const button = preview.getByRole('button', { name: '已点击 0 次', exact: true })
      await expect(button).toBeEnabled()
      await button.click()
      await expect(preview.getByRole('button', { name: '已点击 1 次', exact: true })).toBeVisible()
    })

    test('input accepts text', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'input', 'input-01')
      const input = preview.locator('input').first()
      await input.fill('Hello Tigercat')
      await expect(input).toHaveValue('Hello Tigercat')
    })

    test('checkbox and switch toggle', async ({ page }) => {
      let opened = await openDemo(page, baseUrl, 'checkbox', 'checkbox-01')
      const checkbox = opened.preview.locator('input[type="checkbox"]').first()
      await checkbox.check()
      await expect(checkbox).toBeChecked()

      opened = await openDemo(page, baseUrl, 'switch', 'switch-01')
      const switchControl = opened.preview.getByRole('switch').first()
      await expect(switchControl).toBeVisible()
      await expect(switchControl).toBeChecked()
      await switchControl.click()
      await expect(switchControl).not.toBeChecked()
    })

    test('select and alert render', async ({ page }) => {
      let opened = await openDemo(page, baseUrl, 'select', 'select-01')
      await expect(opened.preview.locator('[aria-haspopup="listbox"]').first()).toBeVisible()

      opened = await openDemo(page, baseUrl, 'alert', 'alert-01')
      await expect(opened.preview.getByRole('alert').first()).toBeVisible()
    })

    test('modal and tooltip stay interactive in the sandbox', async ({ page }) => {
      let opened = await openDemo(page, baseUrl, 'modal', 'modal-01')
      await opened.preview.getByRole('button', { name: '打开对话框', exact: true }).click()
      await expect(opened.preview.getByRole('dialog')).toBeVisible()

      opened = await openDemo(page, baseUrl, 'tooltip', 'tooltip-01')
      await opened.preview.locator('[data-tooltip-trigger], button').first().hover()
      await expect(opened.preview.getByRole('tooltip')).toContainText('保存当前草稿')
    })

    test('table and tabs render', async ({ page }) => {
      let opened = await openDemo(page, baseUrl, 'table', 'table-01')
      await expect(opened.preview.locator('tbody tr').first()).toBeVisible()

      opened = await openDemo(page, baseUrl, 'tabs', 'tabs-01')
      const tabs = opened.preview.getByRole('tab')
      await expect(tabs.nth(1)).toBeVisible()
      await tabs.nth(1).click()
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    })

    test('navigation components render', async ({ page }) => {
      let opened = await openDemo(page, baseUrl, 'menu', 'menu-01')
      await expect(
        opened.preview.locator('[role="menu"], [role="menubar"], nav').first()
      ).toBeVisible()

      opened = await openDemo(page, baseUrl, 'breadcrumb', 'breadcrumb-01')
      await expect(opened.preview.locator('nav').first()).toBeVisible()

      opened = await openDemo(page, baseUrl, 'pagination', 'pagination-01')
      await expect(opened.preview.locator('nav[aria-label]').first()).toBeVisible()
    })

    for (const route of ['bar-chart', 'line-chart', 'pie-chart'] as const) {
      test(`${route} renders SVG`, async ({ page }) => {
        const { preview } = await openDemo(page, baseUrl, route, `${route}-01`)
        await expect(preview.locator('svg').first()).toBeVisible()
      })
    }

    test('layout examples render', async ({ page }) => {
      let opened = await openDemo(page, baseUrl, 'grid', 'grid-01')
      await expect(opened.preview.getByText('col-8').first()).toBeVisible()

      opened = await openDemo(page, baseUrl, 'divider', 'divider-01')
      await expect(
        opened.preview.locator('[role="separator"], hr, [class*="divider"]').first()
      ).toBeVisible()
    })

    test('route URLs remain stable', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'button'), { waitUntil: 'domcontentloaded' })
      await expect(page.locator('[data-demo-id="button-01"]')).toBeVisible()
    })
  })
}
