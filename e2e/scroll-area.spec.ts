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
    test('renders a custom thumb sized to the overflow', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      const thumb = preview.locator('[data-scroll-area-thumb="y"]')
      await expect(thumb).toBeVisible()

      const thumbBox = await thumb.boundingBox()
      const trackBox = await preview.locator('[data-scroll-area-scrollbar="y"]').boundingBox()
      // Content is roughly 3x the viewport, so the thumb covers only part of the track
      expect(thumbBox!.height).toBeLessThan(trackBox!.height)
      expect(thumbBox!.height).toBeGreaterThan(0)
    })

    test('hides the native scrollbar on the viewport', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      const gutter = await viewport(preview).evaluate((el) => el.offsetWidth - el.clientWidth)
      expect(gutter).toBe(0)
    })

    test('reveals the top shadow after scrolling down', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      await expect(preview.locator('[data-scroll-area-shadow="top"]')).toHaveCount(0)

      await viewport(preview).evaluate((el) => el.scrollTo({ top: 120 }))
      await expect(preview.locator('[data-scroll-area-shadow="top"]')).toBeVisible()
      await expect(preview.locator('[data-scroll-area-shadow="bottom"]')).toBeVisible()
    })

    test('drags the thumb to scroll the content', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      const thumb = preview.locator('[data-scroll-area-thumb="y"]')
      // hover first so the thumb is scrolled into the page viewport before
      // raw mouse coordinates are read
      await thumb.hover()
      const box = (await thumb.boundingBox())!

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, { steps: 5 })
      await page.mouse.up()

      expect(await scrollTopOf(preview)).toBeGreaterThan(0)
    })

    test('jumps to a position clicked on the track', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-01')
      const track = preview.locator('[data-scroll-area-scrollbar="y"]')
      const height = await track.evaluate((el) => (el as HTMLElement).offsetHeight)

      await track.click({ position: { x: 2, y: height * 0.8 } })
      expect(await scrollTopOf(preview)).toBeGreaterThan(0)
    })

    test('manages both axes when direction is both', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-02')
      await expect(preview.locator('[data-scroll-area-scrollbar="y"]')).toBeVisible()
      await expect(preview.locator('[data-scroll-area-scrollbar="x"]')).toBeVisible()

      const track = preview.locator('[data-scroll-area-scrollbar="x"]')
      const width = await track.evaluate((el) => (el as HTMLElement).offsetWidth)
      // stay clear of the corner where the vertical track overlaps
      await track.click({ position: { x: width * 0.75, y: 2 } })

      const scrollLeft = await viewport(preview).evaluate((el) => el.scrollLeft)
      expect(scrollLeft).toBeGreaterThan(0)
    })

    test('scrolls imperatively and reports progress', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-03')
      await expect(preview.getByText('滚动进度：0%')).toBeVisible()

      await preview.getByRole('button', { name: '滚动到底部' }).click()
      await expect(preview.getByText('滚动进度：100%')).toBeVisible()

      await preview.getByRole('button', { name: '回到顶部' }).click()
      await expect(preview.getByText('滚动进度：0%')).toBeVisible()
    })

    test('keeps the viewport reachable by keyboard', async ({ page }) => {
      const { preview } = await openDemo(page, baseUrl, 'scroll-area', 'scroll-area-03')
      await viewport(preview).focus()
      await page.keyboard.press('End')
      await expect(preview.getByText('滚动进度：100%')).toBeVisible()
    })
  })
}
