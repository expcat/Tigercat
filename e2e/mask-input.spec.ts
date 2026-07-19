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
  test.describe(`${framework} — MaskInput`, () => {
    test('auto-inserts fixed characters while typing a date', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'mask-input', 'mask-input-01')
      const dateInput = preview.getByPlaceholder('MM/DD/YYYY')
      await dateInput.click()
      await page.keyboard.type('12252026')
      await expect(dateInput).toHaveValue('12/25/2026')
      await expect(preview.getByText('原始值：12252026')).toBeVisible()
    })

    test('keeps the caret at the end after auto-insertion', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'mask-input', 'mask-input-01')
      const dateInput = preview.getByPlaceholder('MM/DD/YYYY')
      await dateInput.click()
      await page.keyboard.type('12')
      const caret = await dateInput.evaluate((el: HTMLInputElement) => el.selectionStart)
      // '12/' — caret after the eagerly inserted slash
      expect(caret).toBe(3)
    })

    test('backspace steps over a fixed character', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'mask-input', 'mask-input-01')
      const dateInput = preview.getByPlaceholder('MM/DD/YYYY')
      await dateInput.click()
      await page.keyboard.type('123')
      // value is '12/3'; two backspaces should delete '3' then '2'
      await page.keyboard.press('Backspace')
      await expect(dateInput).toHaveValue('12/')
      await page.keyboard.press('Backspace')
      await expect(dateInput).toHaveValue('1')
    })

    test('reformats a dirty pasted phone string', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'mask-input', 'mask-input-01')
      const phoneInput = preview.getByPlaceholder('(555) 123-4567')
      await phoneInput.click()
      await dispatchPaste(phoneInput, '555.123.4567')
      await expect(phoneInput).toHaveValue('(555) 123-4567')
      await expect(preview.getByText('电话原始值：5551234567')).toBeVisible()
    })
  })
}
