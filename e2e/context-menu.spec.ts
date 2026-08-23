import { expect, test } from '@playwright/test'
import { exampleApps, openDemo } from './example-helpers'

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — ContextMenu`, () => {
    test('opens on right click, navigates with the keyboard, and closes on Escape', async ({
      page
    }) => {
      const { preview } = await openDemo(page, baseUrl, 'context-menu', 'context-menu-01')
      const surface = preview.getByText('在此区域右键')
      await expect(surface).toBeVisible()

      await surface.click({ button: 'right' })
      const menu = preview.locator('[data-tiger-context-menu]')
      await expect(menu).toBeVisible()
      const copy = preview.getByRole('menuitem', { name: '复制' })
      await expect(copy).toBeVisible()
      await copy.focus()
      await page.keyboard.press('ArrowDown')
      await expect(preview.getByRole('menuitem', { name: '粘贴' })).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(preview.getByText('最近操作：粘贴')).toBeVisible()
      await expect(menu).toBeHidden()

      await surface.click({ button: 'right' })
      await expect(menu).toBeVisible()
      await preview.getByRole('menuitem', { name: '复制' }).focus()
      await page.keyboard.press('Escape')
      await expect(menu).toBeHidden()
    })

    test('opens a nested submenu with ArrowRight', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'context-menu', 'context-menu-02')
      const surface = preview.getByText('右键打开带有子菜单的面板')
      await surface.click({ button: 'right' })

      const subTrigger = preview.getByRole('menuitem', { name: '分享到' })
      await expect(subTrigger).toBeVisible()
      await subTrigger.focus()
      await page.keyboard.press('ArrowRight')
      await expect(subTrigger).toHaveAttribute('aria-expanded', 'true')
      const mail = preview.getByRole('menuitem', { name: '邮件' })
      await expect(mail).toBeVisible()
      await mail.focus()
      await page.keyboard.press('Enter')
      await expect(preview.getByText('最近操作：邮件')).toBeVisible()
    })
  })
}
