import { expect, test, type Locator } from '@playwright/test'
import { exampleApps, openDemo } from './example-helpers'

async function dispatchPaste(locator: Locator, text: string) {
  await locator.evaluate((el: HTMLElement, value: string) => {
    const data = new DataTransfer()
    data.setData('text', value)
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true })
    )
  }, text)
}

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — InputOTP`, () => {
    test('types across slots and advances focus, then completes', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'input-otp', 'input-otp-01')
      const slots = preview.getByRole('group').locator('input[type="text"]')
      await slots.first().click()
      await page.keyboard.type('123456')
      await expect(slots.nth(0)).toHaveValue('1')
      await expect(slots.nth(5)).toHaveValue('6')
      await expect(preview.getByText('已完成：123456')).toBeVisible()
    })

    test('distributes a pasted code from the first slot', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'input-otp', 'input-otp-01')
      const slots = preview.getByRole('group').locator('input[type="text"]')
      await slots.first().click()
      await dispatchPaste(slots.first(), '654321')
      await expect(slots.nth(0)).toHaveValue('6')
      await expect(slots.nth(5)).toHaveValue('1')
    })

    test('filters out non-numeric characters on paste', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'input-otp', 'input-otp-01')
      const slots = preview.getByRole('group').locator('input[type="text"]')
      await slots.first().click()
      await dispatchPaste(slots.first(), '12-34-56')
      await expect(slots.nth(0)).toHaveValue('1')
      await expect(slots.nth(5)).toHaveValue('6')
    })

    test('backspace chains back through filled slots', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'input-otp', 'input-otp-01')
      const slots = preview.getByRole('group').locator('input[type="text"]')
      await slots.first().click()
      await page.keyboard.type('123')
      await page.keyboard.press('Backspace')
      await page.keyboard.press('Backspace')
      await expect(slots.nth(2)).toHaveValue('')
      await expect(slots.nth(1)).toHaveValue('')
      await expect(slots.nth(0)).toHaveValue('1')
    })

    test('arrow keys move focus between slots', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'input-otp', 'input-otp-01')
      const slots = preview.getByRole('group').locator('input[type="text"]')
      await slots.first().click()
      await page.keyboard.press('ArrowRight')
      await expect(slots.nth(1)).toBeFocused()
      await page.keyboard.press('ArrowLeft')
      await expect(slots.nth(0)).toBeFocused()
    })
  })
}
