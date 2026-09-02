import { expect, test } from '@playwright/test'
import { exampleApps, openDemo, revealDemoIframe } from './example-helpers'

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — Interaction flows`, () => {
    // Overlay iframes plus page chrome need more than Playwright Desktop 1280x720.
    test.use({ viewport: { width: 1280, height: 1400 } })
    test('modal form validates and submits', async ({ page }) => {
      const { moduleRoot, preview } = await openDemo(page, baseUrl, 'modal', 'modal-04')
      await preview.getByRole('button', { name: '编辑资料', exact: true }).click()
      const dialog = preview.getByRole('dialog').filter({ hasText: '编辑资料' })
      await expect(dialog).toBeVisible()

      const initialDialogBox = await dialog.boundingBox()
      await dialog.locator('[aria-haspopup="listbox"]').click()
      const listbox = preview.getByRole('listbox')
      await expect(listbox).toBeVisible()
      const popupFitsViewport = await listbox.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return (
          rect.left >= 0 &&
          rect.top >= 0 &&
          rect.right <= document.documentElement.clientWidth &&
          rect.bottom <= document.documentElement.clientHeight
        )
      })
      expect(popupFitsViewport).toBe(true)
      const openDialogBox = await dialog.boundingBox()
      expect(openDialogBox?.width).toBe(initialDialogBox?.width)
      expect(openDialogBox?.height).toBe(initialDialogBox?.height)
      await listbox.getByRole('option').first().click()
      await expect(listbox).toBeHidden()

      await revealDemoIframe(moduleRoot)
      await dialog.getByRole('button', { name: '保存', exact: true }).click()
      await expect(dialog.getByText('请填写姓名')).toBeVisible()
      await dialog.getByPlaceholder('请输入姓名').fill('Tigercat User')
      await dialog.getByPlaceholder('name@example.com').fill('user@example.com')
      await revealDemoIframe(moduleRoot)
      await dialog.getByRole('button', { name: '保存', exact: true }).click()
      await expect(dialog).toBeHidden({ timeout: 3_000 })
    })

    test('drawer opens and closes from the footer action', async ({ page }) => {
      const { moduleRoot, preview } = await openDemo(page, baseUrl, 'drawer', 'drawer-01')
      await preview.getByRole('button', { name: '打开抽屉', exact: true }).click()
      const drawer = preview.getByRole('dialog').filter({ hasText: '基本抽屉' })
      await expect(drawer).toBeVisible()
      const initialDrawerBox = await drawer.boundingBox()
      await drawer.locator('[aria-haspopup="listbox"]').click()
      const listbox = preview.getByRole('listbox')
      await expect(listbox).toBeVisible()
      const openDrawerBox = await drawer.boundingBox()
      expect(openDrawerBox?.width).toBe(initialDrawerBox?.width)
      expect(openDrawerBox?.height).toBe(initialDrawerBox?.height)
      await listbox.getByRole('option', { name: 'Alice' }).click()
      await expect(listbox).toBeHidden()
      await revealDemoIframe(moduleRoot)
      // Footer Button has text 关闭; header X only has aria-label 关闭.
      await drawer.getByText('关闭', { exact: true }).click()
      await expect(drawer).toBeHidden()
    })
  })
}
