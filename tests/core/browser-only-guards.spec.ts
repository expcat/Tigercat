/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  announceToScreenReader,
  captureActiveElement,
  createAnchorObserver,
  createFocusTrap,
  cropCanvas,
  downloadChartPng,
  downloadChartSvg,
  downloadCsv,
  downloadExcel,
  downloadTableExport,
  exportChartPng,
  findActiveAnchor,
  getAnchorTargetElement,
  getContainerHeight,
  getContainerScrollTop,
  getElementOffsetTop,
  handleMenuNavigation,
  manageLiveRegion,
  scrollToAnchor
} from '@expcat/tigercat-core'

describe('browser-only utility guards', () => {
  it('no-ops browser side effects when document/window are unavailable', async () => {
    expect(() => announceToScreenReader('Saved')).not.toThrow()

    const liveRegion = manageLiveRegion()
    expect(() => liveRegion.announce('Saved')).not.toThrow()
    expect(() => liveRegion.clear()).not.toThrow()
    expect(() => liveRegion.destroy()).not.toThrow()

    const focusTrap = createFocusTrap({} as HTMLElement)
    expect(() => focusTrap.activate()).not.toThrow()
    expect(() => focusTrap.deactivate()).not.toThrow()

    expect(() => downloadCsv('name\nAda')).not.toThrow()
    expect(() => downloadExcel('<table></table>')).not.toThrow()
    expect(() => downloadTableExport('name\nAda')).not.toThrow()
    expect(() => downloadChartSvg({} as SVGSVGElement)).not.toThrow()
    await expect(downloadChartPng({} as SVGSVGElement)).resolves.toBeUndefined()
  })

  it('returns stable fallbacks for DOM query and focus helpers outside the browser', () => {
    const container = { scrollTop: 12, clientHeight: 240 } as HTMLElement
    const element = {} as HTMLElement

    expect(captureActiveElement()).toBeNull()
    expect(getAnchorTargetElement('#section')).toBeNull()
    expect(getContainerScrollTop(container)).toBe(12)
    expect(getContainerHeight(container)).toBe(240)
    expect(getElementOffsetTop(element, container)).toBe(0)
    expect(findActiveAnchor(['#first', '#second'], container)).toBe('#first')
    expect(() => scrollToAnchor('#first', container)).not.toThrow()

    const disconnect = createAnchorObserver(['#first'], { onChange: () => {} })
    expect(disconnect).toEqual(expect.any(Function))
    expect(() => disconnect()).not.toThrow()

    const menu = { querySelectorAll: () => [] } as unknown as HTMLElement
    expect(handleMenuNavigation(menu, { key: 'ArrowDown' } as KeyboardEvent)).toBe(false)
  })

  it('throws explicit browser-only errors for canvas-producing exports', async () => {
    expect(() =>
      cropCanvas({} as HTMLImageElement, { x: 0, y: 0, width: 1, height: 1 }, 1, 1)
    ).toThrow('Image canvas cropping is only available in the browser')

    await expect(exportChartPng({} as SVGSVGElement)).rejects.toThrow(
      'Chart PNG export is only available in the browser'
    )
  })
})
