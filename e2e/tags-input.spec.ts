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
  test.describe(`${framework} — TagsInput`, () => {
    test('adds a tag on Enter', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'tags-input', 'tags-input-01')
      const input = preview.getByRole('textbox').first()
      await input.click()
      await page.keyboard.type('typescript')
      await page.keyboard.press('Enter')
      await expect(preview.getByText('typescript', { exact: true })).toBeVisible()
    })

    test('splits on a delimiter while typing', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'tags-input', 'tags-input-01')
      const input = preview.getByRole('textbox').first()
      await input.click()
      await page.keyboard.type('one,two,')
      await expect(preview.getByText('one', { exact: true })).toBeVisible()
      await expect(preview.getByText('two', { exact: true })).toBeVisible()
    })

    test('batch-adds pasted multi-value text', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'tags-input', 'tags-input-01')
      const input = preview.getByRole('textbox').first()
      await input.click()
      await dispatchPaste(input, 'red, green, blue')
      await expect(preview.getByText('red', { exact: true })).toBeVisible()
      await expect(preview.getByText('green', { exact: true })).toBeVisible()
      await expect(preview.getByText('blue', { exact: true })).toBeVisible()
    })

    test('two-stage backspace removes the last tag', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'tags-input', 'tags-input-01')
      const input = preview.getByRole('textbox').first()
      await input.click()
      // demo starts with ['vue', 'react']
      await page.keyboard.press('Backspace') // highlight
      await expect(preview.getByText('react', { exact: true })).toBeVisible()
      await page.keyboard.press('Backspace') // remove
      await expect(preview.getByText('react', { exact: true })).toHaveCount(0)
    })

    test('rejects adds once max is reached', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'tags-input', 'tags-input-01')
      const input = preview.getByRole('textbox').first()
      await input.click()
      // demo max is 5, starts with 2 tags — add up to the cap then one more
      await page.keyboard.type('a,b,c,')
      await page.keyboard.type('overflow')
      await page.keyboard.press('Enter')
      await expect(preview.getByText('overflow', { exact: true })).toHaveCount(0)
    })
  })
}
