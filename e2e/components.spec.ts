import { expect, test } from '@playwright/test'
import { demoUrl, exampleApps, openDemo } from './example-helpers'

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — Example shell`, () => {
    test('home page loads', async ({ page }) => {
      await page.goto(baseUrl)
      await expect(page).toHaveTitle(/tigercat/i)
    })

    test('sandbox overlay stays interactive', async ({ page }) => {
      const opened = await openDemo(page, baseUrl, 'modal', 'modal-01')
      await opened.preview.getByRole('button', { name: '打开对话框', exact: true }).click()
      await expect(opened.preview.getByRole('dialog')).toBeVisible()
    })

    test('route URLs remain stable', async ({ page }) => {
      await page.goto(demoUrl(baseUrl, 'button'), { waitUntil: 'domcontentloaded' })
      await expect(page.locator('[data-demo-id="button-01"]')).toBeVisible()
    })
  })
}
