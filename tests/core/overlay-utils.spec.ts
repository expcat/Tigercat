/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  getFocusableElements,
  getFocusTrapNavigation,
  isEventOutside,
  registerEscapeDismiss,
  setBackgroundInert,
  isFocusInForeignOverlay,
  shouldCloseOnMaskClick,
  shouldRenderOverlay,
  isOverlayVisuallyHidden,
  scheduleOverlayLeave,
  canStartOverlaySwipeClose,
  isOverlayDragHandleEvent,
  clampOverlayDragOffset
} from '@expcat/tigercat-core'

describe('overlay-utils (core)', () => {
  it('isEventOutside should return false when target is inside container', () => {
    const container = document.createElement('div')
    const inside = document.createElement('button')
    container.appendChild(inside)
    document.body.appendChild(container)

    const event = new MouseEvent('click', { bubbles: true })
    Object.defineProperty(event, 'target', {
      value: inside,
      configurable: true
    })

    expect(isEventOutside(event, [container])).toBe(false)
  })

  it('isEventOutside should return true when target is outside container', () => {
    const container = document.createElement('div')
    const inside = document.createElement('button')
    const outside = document.createElement('div')
    container.appendChild(inside)
    document.body.appendChild(container)
    document.body.appendChild(outside)

    const event = new MouseEvent('click', { bubbles: true })
    Object.defineProperty(event, 'target', {
      value: outside,
      configurable: true
    })

    expect(isEventOutside(event, [container])).toBe(true)
  })

  it('isEventOutside should treat ignored elements as inside', () => {
    const container = document.createElement('div')
    const trigger = document.createElement('button')
    document.body.appendChild(container)
    document.body.appendChild(trigger)

    const event = new MouseEvent('click', { bubbles: true })
    Object.defineProperty(event, 'target', {
      value: trigger,
      configurable: true
    })

    expect(isEventOutside(event, [container], { ignore: [trigger] })).toBe(false)
  })

  it('isEventOutside should use the composed path across portal and shadow boundaries', () => {
    const container = document.createElement('div')
    const portalChild = document.createElement('button')
    const event = new MouseEvent('click', { bubbles: true })
    Object.defineProperty(event, 'composedPath', {
      value: () => [portalChild, container, document.body, document, window]
    })

    expect(isEventOutside(event, [container])).toBe(false)
  })

  it('shouldRenderOverlay keeps the first open frame and idle closed trees apart', () => {
    expect(
      shouldRenderOverlay({ open: true, hasOpened: false, leaving: false, destroyOnClose: false })
    ).toBe(true)
    expect(
      shouldRenderOverlay({ open: false, hasOpened: false, leaving: false, destroyOnClose: false })
    ).toBe(false)
    expect(
      shouldRenderOverlay({ open: false, hasOpened: true, leaving: false, destroyOnClose: false })
    ).toBe(true)
    expect(
      shouldRenderOverlay({ open: false, hasOpened: true, leaving: false, destroyOnClose: true })
    ).toBe(false)
    expect(
      shouldRenderOverlay({ open: false, hasOpened: true, leaving: true, destroyOnClose: true })
    ).toBe(true)
    expect(isOverlayVisuallyHidden(false, true)).toBe(false)
    expect(isOverlayVisuallyHidden(false, false)).toBe(true)
  })

  it('canStartOverlaySwipeClose only allows close from a handle or a scroll edge', () => {
    const handle = document.createElement('div')
    handle.setAttribute('data-tiger-overlay-handle', '')
    const inner = document.createElement('span')
    handle.appendChild(inner)

    const scroller = document.createElement('div')
    Object.defineProperty(scroller, 'scrollTop', { value: 40, configurable: true })
    Object.defineProperty(scroller, 'clientHeight', { value: 100, configurable: true })
    Object.defineProperty(scroller, 'scrollHeight', { value: 400, configurable: true })

    expect(
      canStartOverlaySwipeClose({
        target: inner,
        scrollContainer: scroller,
        closeDirection: 'down'
      })
    ).toBe(true)
    expect(
      canStartOverlaySwipeClose({
        target: scroller,
        scrollContainer: scroller,
        closeDirection: 'down'
      })
    ).toBe(false)

    Object.defineProperty(scroller, 'scrollTop', { value: 0, configurable: true })
    expect(
      canStartOverlaySwipeClose({
        target: scroller,
        scrollContainer: scroller,
        closeDirection: 'down'
      })
    ).toBe(true)
  })

  it('isOverlayDragHandleEvent ignores buttons inside the handle', () => {
    const handle = document.createElement('div')
    const button = document.createElement('button')
    handle.appendChild(button)
    expect(isOverlayDragHandleEvent({ target: handle })).toBe(true)
    expect(isOverlayDragHandleEvent({ target: button })).toBe(false)
  })

  it('clampOverlayDragOffset keeps a strip of the panel in the viewport', () => {
    const next = clampOverlayDragOffset(
      { x: 0, y: 0 },
      { x: 4000, y: 4000 },
      { left: 100, top: 80, width: 200, height: 120 },
      { width: 800, height: 600 },
      48
    )
    expect(next.x).toBe(800 - 48 - 100)
    expect(next.y).toBe(600 - 48 - 80)
  })

  it('scheduleOverlayLeave finishes immediately when motion is reduced', () => {
    const onFinish = vi.fn()
    const cancel = scheduleOverlayLeave({ onFinish, reducedMotion: true })
    expect(onFinish).toHaveBeenCalledTimes(1)
    cancel()
  })

  it('shouldCloseOnMaskClick should only close for direct mask clicks when enabled', () => {
    const mask = document.createElement('div')
    const content = document.createElement('div')

    expect(shouldCloseOnMaskClick({ target: mask, currentTarget: mask }, true)).toBe(true)
    expect(shouldCloseOnMaskClick({ target: content, currentTarget: mask }, true)).toBe(false)
    expect(shouldCloseOnMaskClick({ target: mask, currentTarget: mask }, false)).toBe(false)
  })

  it('getFocusableElements should filter disabled, untabbable, and hidden descendants', () => {
    const root = document.createElement('div')

    const link = document.createElement('a')
    link.href = '#'

    const button = document.createElement('button')

    const disabledButton = document.createElement('button')
    disabledButton.setAttribute('disabled', '')

    const tabNeg = document.createElement('div')
    tabNeg.tabIndex = -1

    const input = document.createElement('input')

    const hiddenParent = document.createElement('div')
    hiddenParent.style.display = 'none'
    const hiddenButton = document.createElement('button')
    hiddenParent.appendChild(hiddenButton)

    root.appendChild(link)
    root.appendChild(button)
    root.appendChild(disabledButton)
    root.appendChild(tabNeg)
    root.appendChild(input)
    root.appendChild(hiddenParent)

    const focusables = getFocusableElements(root)

    expect(focusables).toContain(link)
    expect(focusables).toContain(button)
    expect(focusables).toContain(input)
    expect(focusables).not.toContain(disabledButton)
    expect(focusables).not.toContain(tabNeg)
    expect(focusables).not.toContain(hiddenButton)
  })

  it('getFocusableElements skips inert subtrees and disabled fieldsets', () => {
    const root = document.createElement('div')
    const inertWrap = document.createElement('div')
    inertWrap.setAttribute('inert', '')
    const inertButton = document.createElement('button')
    inertWrap.appendChild(inertButton)

    const fieldset = document.createElement('fieldset')
    fieldset.disabled = true
    const fieldsetInput = document.createElement('input')
    fieldset.appendChild(fieldsetInput)

    const visible = document.createElement('button')
    root.append(inertWrap, fieldset, visible)

    expect(getFocusableElements(root)).toEqual([visible])
  })

  it('getFocusTrapNavigation should wrap focus on Tab at edges', () => {
    const a = document.createElement('button')
    const b = document.createElement('button')
    const focusables = [a, b]

    expect(getFocusTrapNavigation({ key: 'Tab', shiftKey: false }, focusables, b)).toEqual({
      shouldHandle: true,
      next: a
    })

    expect(getFocusTrapNavigation({ key: 'Tab', shiftKey: true }, focusables, a)).toEqual({
      shouldHandle: true,
      next: b
    })
  })

  it('getFocusTrapNavigation still handles Tab when there are no focusables', () => {
    expect(getFocusTrapNavigation({ key: 'Tab' }, [], null)).toEqual({ shouldHandle: true })
  })

  it('setBackgroundInert marks siblings of the overlay as inert', () => {
    const app = document.createElement('div')
    const overlay = document.createElement('div')
    document.body.append(app, overlay)

    const release = setBackgroundInert(overlay)
    expect(app.hasAttribute('inert')).toBe(true)

    release()
    expect(app.hasAttribute('inert')).toBe(false)
  })

  it('setBackgroundInert leaves sibling overlay layers interactive', () => {
    const app = document.createElement('div')
    const outer = document.createElement('div')
    outer.setAttribute('data-tiger-overlay-layer', '')
    const inner = document.createElement('div')
    inner.setAttribute('data-tiger-overlay-layer', '')
    document.body.append(app, outer, inner)

    const release = setBackgroundInert(outer)
    expect(app.hasAttribute('inert')).toBe(true)
    expect(inner.hasAttribute('inert')).toBe(false)
    release()
  })

  it('isFocusInForeignOverlay is true only for a different overlay layer', () => {
    const outer = document.createElement('div')
    outer.setAttribute('data-tiger-overlay-layer', '')
    const inner = document.createElement('div')
    inner.setAttribute('data-tiger-overlay-layer', '')
    const button = document.createElement('button')
    inner.appendChild(button)
    document.body.append(outer, inner)

    expect(isFocusInForeignOverlay(outer, button)).toBe(true)
    expect(isFocusInForeignOverlay(inner, button)).toBe(false)
    expect(isFocusInForeignOverlay(outer, document.body)).toBe(false)

    outer.appendChild(inner)
    expect(isFocusInForeignOverlay(outer, button)).toBe(true)
  })

  it('registerEscapeDismiss should dismiss only the topmost overlay', () => {
    const calls: string[] = []
    const removeOuter = registerEscapeDismiss(document, () => calls.push('outer'))
    const removeInner = registerEscapeDismiss(document, () => calls.push('inner'))

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    expect(calls).toEqual(['inner'])

    removeInner()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    expect(calls).toEqual(['inner', 'outer'])
    removeOuter()
  })

  it('registerEscapeDismiss should prefer the deepest DOM layer over registration order', () => {
    const calls: string[] = []
    const outerLayer = document.createElement('div')
    const innerLayer = document.createElement('div')
    outerLayer.appendChild(innerLayer)
    document.body.appendChild(outerLayer)

    const removeInner = registerEscapeDismiss(
      document,
      () => calls.push('inner'),
      () => innerLayer
    )
    const removeOuter = registerEscapeDismiss(
      document,
      () => calls.push('outer'),
      () => outerLayer
    )

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    expect(calls).toEqual(['inner'])

    removeOuter()
    removeInner()
  })

  it('unregistering the last Escape listener removes the document handler', () => {
    const remove = registerEscapeDismiss(document, () => undefined)
    expect(document.querySelector).toBeDefined()
    remove()
    const calls: string[] = []
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
    expect(calls).toEqual([])
  })
})
