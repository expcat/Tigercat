import { expect, test } from '@playwright/test'
import { exampleApps, openDemo } from './example-helpers'

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — NavigationMenu`, () => {
    test('opens on keyboard, navigates the panel, and closes on Escape', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'navigation-menu', 'navigation-menu-01')
      const products = preview.getByRole('menuitem', { name: '产品' })
      await expect(products).toBeVisible()
      await products.focus()
      await expect(products).toHaveAttribute('aria-expanded', 'false')
      await products.press('ArrowRight')
      const docs = preview.getByRole('menuitem', { name: '文档' })
      await expect(docs).toBeFocused()
      await docs.press('ArrowDown')
      const overview = preview.getByRole('menuitem', { name: '指南' })
      await expect(overview).toBeVisible()
      await expect(overview).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(preview.getByRole('menuitem', { name: 'API' })).toBeFocused()
      await preview.getByRole('menuitem', { name: 'API' }).press('Enter')
      await expect(preview.getByText('最近操作：API')).toBeVisible()

      await products.focus()
      await products.press('ArrowDown')
      const panel = preview.locator('[data-tiger-navigation-menu-content]').first()
      await expect(panel).toBeVisible()
      await panel.press('Escape')
      await expect(panel).toBeHidden()
    })

    test('toggles the same trigger closed on a second click', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'navigation-menu', 'navigation-menu-01')
      const products = preview.getByRole('menuitem', { name: '产品' })
      await products.click()
      const panel = preview.locator('[data-tiger-navigation-menu-content]').first()
      await expect(panel).toBeVisible()
      await products.click()
      await expect(panel).toBeHidden()
    })

    test('opens a MegaMenu panel from the trigger', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'navigation-menu', 'navigation-menu-02')
      const products = preview.getByRole('menuitem', { name: '产品' })
      await products.focus()
      await products.press('ArrowDown')
      await expect(preview.getByRole('menuitem', { name: '分析' })).toBeVisible()
      await preview.getByRole('menuitem', { name: '分析' }).click()
      await expect(preview.getByText('最近操作：分析')).toBeVisible()
    })
  })
}
