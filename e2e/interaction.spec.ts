import { expect, test, type Page } from '@playwright/test'

const targets = [
  { label: 'Vue', baseUrl: 'http://localhost:5173' },
  { label: 'React', baseUrl: 'http://localhost:5174' }
] as const

function demoUrl(baseUrl: string, path: string): string {
  return `${baseUrl}/#/${path}`
}

async function preparePage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' })
}

for (const { label, baseUrl } of targets) {
  test.describe(`${label} — Interaction flows`, () => {
    test('modal form validates and submits', async ({ page }) => {
      await preparePage(page, demoUrl(baseUrl, 'modal'))

      await page.getByRole('button', { name: '编辑资料' }).click()
      const dialog = page.getByRole('dialog').filter({ hasText: '编辑资料' })
      await expect(dialog).toBeVisible()

      await dialog.getByRole('button', { name: '保存' }).click()
      await expect(dialog.getByText('请填写姓名')).toBeVisible()

      await dialog.getByPlaceholder('请输入姓名').fill('Tigercat User')
      await dialog.getByPlaceholder('name@example.com').fill('user@example.com')
      await dialog.getByRole('button', { name: '保存' }).click()

      await expect(dialog).toBeHidden({ timeout: 3000 })
    })

    test('drawer opens and closes from the footer action', async ({ page }) => {
      await preparePage(page, demoUrl(baseUrl, 'drawer'))

      await page.getByRole('button', { name: '打开抽屉' }).first().click()
      const drawer = page.getByRole('dialog').filter({ hasText: '基本抽屉' })
      await expect(drawer).toBeVisible()

      await drawer.getByRole('button', { name: '关闭' }).click()
      await expect(drawer).toBeHidden()
    })

    test('tabs switch active panels', async ({ page }) => {
      await preparePage(page, demoUrl(baseUrl, 'tabs'))

      const tabs = page.getByRole('tab')
      await expect(tabs.nth(1)).toBeVisible()
      await tabs.nth(1).click()

      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    })

    test('table sorting and filtering update visible rows', async ({ page }) => {
      await preparePage(page, demoUrl(baseUrl, 'table'))

      const sortingTable = page.locator('table').nth(2)
      await sortingTable.getByRole('columnheader', { name: /Name/ }).click()
      await expect(sortingTable.locator('tbody tr').first()).toContainText('Alice Brown')

      await page.getByPlaceholder('Search name...').fill('Jane')
      const filterTable = page.locator('table').nth(3)
      await expect(filterTable.locator('tbody tr')).toHaveCount(1)
      await expect(filterTable.locator('tbody tr').first()).toContainText('Jane Smith')
    })
  })
}
