import { expect, test, type Locator } from '@playwright/test'
import { openDemo } from './example-helpers'

const REACT_URL = 'http://127.0.0.1:5174'

async function dispatchPointerSwipe(
  target: Locator,
  startX: number,
  endX: number,
  y = 120
): Promise<void> {
  await target.evaluate(
    (element, points) => {
      const pointer = (type: string, x: number) =>
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'touch',
          button: 0,
          buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
          clientX: x,
          clientY: points.y
        })

      element.dispatchEvent(pointer('pointerdown', points.startX))
      element.dispatchEvent(pointer('pointermove', points.endX))
      element.dispatchEvent(pointer('pointerup', points.endX))
    },
    { startX, endX, y }
  )
}

async function dispatchTouchSwipe(
  target: Locator,
  startX: number,
  endX: number,
  y = 120
): Promise<void> {
  await target.evaluate(
    (element, points) => {
      const createTouch = (x: number) =>
        new Touch({ identifier: 1, target: element, clientX: x, clientY: points.y })

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
    test.skip(testInfo.project.name !== 'mobile-chromium', 'Touch coverage uses mobile Chromium')
    const { preview } = await openDemo(page, REACT_URL, 'carousel', 'carousel-01')
    const carousel = preview.locator('[data-tiger-carousel]').first()
    await expect(carousel).toBeVisible()
    const viewport = carousel.locator('[data-tiger-carousel-viewport]')
    await dispatchPointerSwipe(viewport, 320, 80)
    await expect(preview.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('drawer closes with an outward swipe on mobile Chromium', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium', 'Touch coverage uses mobile Chromium')
    const { preview } = await openDemo(page, REACT_URL, 'drawer', 'drawer-01')
    await preview.getByRole('button', { name: '打开抽屉', exact: true }).click()
    const drawer = preview.locator('[data-tiger-drawer]')
    await expect(drawer).toBeVisible()
    await dispatchTouchSwipe(drawer, 260, 360)
    await expect(preview.locator('[data-tiger-drawer-root]')).toBeHidden()
  })
})
