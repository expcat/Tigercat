/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  announceToScreenReader,
  captureActiveElement,
  builtinRichTextEngine,
  createAnchorObserver,
  createFocusTrap,
  cropCanvas,
  downloadChartPng,
  downloadChartSvg,
  createTableResizeObserverController,
  downloadCsv,
  downloadTableExport,
  exportChartPng,
  findActiveAnchor,
  getAnchorTargetElement,
  getContainerScrollTop,
  getElementOffsetTop,
  handleMenuNavigation,
  lockBodyScroll,
  manageLiveRegion,
  scrollToAnchor
} from '@expcat/tigercat-core'

function createRichTextHost() {
  const listeners = new Map<string, EventListener>()
  return {
    contentEditable: 'true',
    innerHTML: '<p>Hello</p>',
    addEventListener(type: string, listener: EventListener) {
      listeners.set(type, listener)
    },
    removeEventListener(type: string) {
      listeners.delete(type)
    },
    focus() {}
  } as unknown as HTMLElement
}

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
    expect(() => downloadTableExport('name\nAda')).not.toThrow()
    expect(() => {
      const controller = createTableResizeObserverController({ onResize: () => {} })
      controller.observe({} as HTMLElement)
      controller.disconnect()
    }).not.toThrow()
    expect(() => downloadChartSvg({} as SVGSVGElement)).not.toThrow()
    await expect(downloadChartPng({} as SVGSVGElement)).resolves.toBeUndefined()
  })

  it('returns stable fallbacks for DOM query and focus helpers outside the browser', () => {
    const container = { scrollTop: 12, clientHeight: 240 } as HTMLElement
    const element = {} as HTMLElement

    expect(captureActiveElement()).toBeNull()
    expect(getAnchorTargetElement('#section')).toBeNull()
    expect(getContainerScrollTop(container)).toBe(12)
    expect(getElementOffsetTop(element, container)).toBe(0)
    expect(findActiveAnchor(['#first', '#second'], container)).toBe('#first')
    expect(() => scrollToAnchor('#first', container)).not.toThrow()

    const disconnect = createAnchorObserver(['#first'], { onChange: () => {} })
    expect(disconnect).toEqual(expect.any(Function))
    expect(() => disconnect()).not.toThrow()

    const menu = {
      querySelectorAll: () => [],
      querySelector: () => null,
      matches: () => true
    } as unknown as HTMLElement
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

  it('no-ops rich text document commands outside the browser', () => {
    const instance = builtinRichTextEngine.create({
      element: createRichTextHost(),
      initialValue: '<p>Hello</p>',
      readOnly: false,
      disabled: false,
      toolbar: [{ name: 'bold', label: 'Bold' }],
      notifyChange: () => {},
      notifyActiveFormats: () => {}
    })

    expect(() => instance.refreshActiveFormats()).not.toThrow()
    expect(() => instance.exec('bold')).not.toThrow()
    expect(() => instance.exec('codeBlock')).not.toThrow()
    expect(() => instance.exec('link')).not.toThrow()
    expect(() => instance.exec('image')).not.toThrow()
    expect(() => instance.destroy()).not.toThrow()
  })

  it('no-ops overlay scroll lock outside the browser', () => {
    const unlock = lockBodyScroll()
    expect(() => unlock()).not.toThrow()
  })
})
