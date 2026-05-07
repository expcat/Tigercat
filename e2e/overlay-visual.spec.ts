import { expect, test, type Page } from '@playwright/test'

const targets = [
  { framework: 'vue', label: 'Vue', baseUrl: 'http://localhost:5173' },
  { framework: 'react', label: 'React', baseUrl: 'http://localhost:5174' }
] as const

async function preparePage(page: Page, url: string): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  })

  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
  })
}

for (const { framework, label, baseUrl } of targets) {
  test.describe(`${label} — Overlay visual regression`, () => {
    test('modal open state matches snapshot', async ({ page }) => {
      await preparePage(page, `${baseUrl}/modal`)
      await page.getByRole('button', { name: '打开对话框' }).first().click()

      const modalRoot = page.locator('[data-tiger-modal-root]:not([hidden])')
      await expect(modalRoot).toBeVisible()
      await page.waitForTimeout(100)
      await expect(modalRoot).toHaveScreenshot(`${framework}-modal-open.png`, {
        animations: 'disabled',
        caret: 'hide'
      })
    })

    test('drawer open state matches snapshot', async ({ page }) => {
      await preparePage(page, `${baseUrl}/drawer`)
      await page.getByRole('button', { name: '打开抽屉' }).first().click()

      const drawerRoot = page.locator('[data-tiger-drawer-root]:not([hidden])')
      await expect(drawerRoot).toBeVisible()
      await page.waitForTimeout(100)
      await expect(drawerRoot).toHaveScreenshot(`${framework}-drawer-open.png`, {
        animations: 'disabled',
        caret: 'hide'
      })
    })

    test('popover open state matches snapshot', async ({ page }) => {
      await preparePage(page, `${baseUrl}/popover`)
      await page.getByRole('button', { name: '触发气泡卡片' }).first().click()

      const popover = page.locator('[role="dialog"][aria-modal="false"]').first()
      await expect(popover).toBeVisible()
      await page.waitForTimeout(100)
      await expect(popover).toHaveScreenshot(`${framework}-popover-open.png`, {
        animations: 'disabled',
        caret: 'hide'
      })
    })
  })
}
