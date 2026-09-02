import { expect, test, type FrameLocator } from '@playwright/test'
import { exampleApps, openDemo } from './example-helpers'

function viewport(preview: FrameLocator) {
  return preview.locator('[data-scroll-area-viewport]')
}

async function scrollTopOf(preview: FrameLocator): Promise<number> {
  return viewport(preview).evaluate((el) => el.scrollTop)
}

for (const { framework, baseUrl } of exampleApps) {
  test.describe(`${framework} — ScrollArea`, () => {
    test('hides the native scrollbar on the viewport', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      const gutter = await viewport(preview).evaluate((el) => el.offsetWidth - el.clientWidth)
      expect(gutter).toBe(0)
    })

    test('drags the thumb to scroll the content', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      const thumb = preview.locator('[data-scroll-area-thumb="y"]')
      await thumb.hover()
      const box = (await thumb.boundingBox())!

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, { steps: 5 })
      await page.mouse.up()

      expect(await scrollTopOf(preview)).toBeGreaterThan(0)
    })
  })
}
