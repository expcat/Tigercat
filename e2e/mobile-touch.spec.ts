import { expect, test, type Page } from '@playwright/test'

async function dispatchSwipe(
  page: Page,
  selector: string,
  startX: number,
  endX: number
): Promise<void> {
  await page
    .locator(selector)
    .first()
    .evaluate(
      (element, points) => {
        const createTouch = (x: number) =>
          new Touch({
            identifier: 1,
            target: element,
            clientX: x,
            clientY: 120
          })

        element.dispatchEvent(
          new TouchEvent('touchstart', { touches: [createTouch(points.startX)] })
        )
        element.dispatchEvent(new TouchEvent('touchmove', { touches: [createTouch(points.endX)] }))
        element.dispatchEvent(
          new TouchEvent('touchend', { changedTouches: [createTouch(points.endX)] })
        )
      },
      { startX, endX }
    )
}

test.describe('Mobile touch interactions', () => {
  test('carousel responds to swipe gestures on mobile Chromium', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile-chromium',
      'Touch gesture coverage runs on mobile project'
    )

    await page.goto('http://localhost:5174/carousel', { waitUntil: 'networkidle' })
    const carouselSelector = '[aria-roledescription="carousel"]'
    await expect(page.locator(carouselSelector).first()).toBeVisible()

    await dispatchSwipe(page, carouselSelector, 320, 80)

    await expect(page.getByRole('button', { name: 'Go to slide 2' }).first()).toHaveAttribute(
      'aria-current',
      'true'
    )
  })
})
