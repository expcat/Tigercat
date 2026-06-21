import { expect, test, type Page } from '@playwright/test'

const REACT_URL = 'http://localhost:5174'

function demoUrl(path: string): string {
  return `${REACT_URL}/#/${path}`
}

async function dispatchSwipe(
  page: Page,
  selector: string,
  startX: number,
  endX: number,
  y = 120
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
            clientY: points.y
          })

        element.dispatchEvent(
          new TouchEvent('touchstart', { bubbles: true, touches: [createTouch(points.startX)] })
        )
        element.dispatchEvent(
          new TouchEvent('touchmove', { bubbles: true, touches: [createTouch(points.endX)] })
        )
        element.dispatchEvent(
          new TouchEvent('touchend', {
            bubbles: true,
            changedTouches: [createTouch(points.endX)]
          })
        )
      },
      { startX, endX, y }
    )
}

test.describe('Mobile touch interactions', () => {
  test('carousel responds to swipe gestures on mobile Chromium', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile-chromium',
      'Touch gesture coverage runs on mobile project'
    )

    await page.goto(demoUrl('carousel'), { waitUntil: 'networkidle' })
    const carouselSelector = '[aria-roledescription="carousel"]'
    await expect(page.locator(carouselSelector).first()).toBeVisible()

    await dispatchSwipe(page, carouselSelector, 320, 80)

    await expect(page.getByRole('button', { name: 'Go to slide 2' }).first()).toHaveAttribute(
      'aria-current',
      'true'
    )
  })

  test('drawer closes with an outward swipe on mobile Chromium', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile-chromium',
      'Touch gesture coverage runs on mobile project'
    )

    await page.goto(demoUrl('drawer'), { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '打开抽屉' }).first().click()

    const drawerSelector = '[data-tiger-drawer]'
    await expect(page.locator(drawerSelector)).toBeVisible()

    await dispatchSwipe(page, drawerSelector, 260, 360)

    await expect(page.locator('[data-tiger-drawer-root]')).toBeHidden()
  })
})
