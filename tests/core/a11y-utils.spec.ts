/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  createAriaIdScope,
  createFloatingIdFactory,
  createFocusScope,
  manageLiveRegion,
  isActivationKey,
  isEnterKey,
  isEscapeKey,
  isSpaceKey,
  isTabKey
} from '@expcat/tigercat-core'

describe('a11y-utils (core)', () => {
  it('createAriaIdScope generates unique ids and isolates requests', () => {
    const first = createAriaIdScope()
    const second = createAriaIdScope()
    expect(first.next()).toBe('tigercat-1')
    expect(first.next()).toBe('tigercat-2')
    expect(second.next()).toBe('tigercat-1')
    expect(first.next({ prefix: 'tiger', separator: '_' })).toBe('tiger_3')
  })

  it('createFloatingIdFactory owns its own id sequence', () => {
    const next = createFloatingIdFactory('tooltip')
    expect(next()).toBe('tiger-tooltip-1')
    expect(next()).toBe('tiger-tooltip-2')
    expect(createFloatingIdFactory('tooltip')()).toBe('tiger-tooltip-1')
  })

  it('key helpers should detect Enter', () => {
    expect(isEnterKey({ key: 'Enter' })).toBe(true)
    expect(isEnterKey({ key: ' ' })).toBe(false)
  })

  it('key helpers should detect Space', () => {
    expect(isSpaceKey({ key: ' ' })).toBe(true)
    expect(isSpaceKey({ key: 'Spacebar' })).toBe(false)
    expect(isSpaceKey({ key: 'Enter' })).toBe(false)
  })

  it('isActivationKey should detect Enter or Space', () => {
    expect(isActivationKey({ key: 'Enter' })).toBe(true)
    expect(isActivationKey({ key: ' ' })).toBe(true)
    expect(isActivationKey({ key: 'Escape' })).toBe(false)
  })

  it('key helpers should detect Escape', () => {
    expect(isEscapeKey({ key: 'Escape' })).toBe(true)
    expect(isEscapeKey({ key: 'Enter' })).toBe(false)
  })

  it('key helpers should detect Tab', () => {
    expect(isTabKey({ key: 'Tab' })).toBe(true)
    expect(isTabKey({ key: 'Enter' })).toBe(false)
  })
})

describe('createFocusScope', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('should focus first focusable element on activate', () => {
    const btn1 = document.createElement('button')
    btn1.textContent = 'First'
    const btn2 = document.createElement('button')
    btn2.textContent = 'Second'
    container.append(btn1, btn2)

    const trap = createFocusScope(container, { moveFocus: true })
    trap.activate()
    expect(document.activeElement).toBe(btn1)
    trap.deactivate()
  })

  it('should focus initialFocus element when provided', () => {
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    container.append(btn1, btn2)

    const trap = createFocusScope(container, { moveFocus: true, initialFocus: btn2 })
    trap.activate()
    expect(document.activeElement).toBe(btn2)
    trap.deactivate()
  })

  it('should return focus on deactivate when returnFocusOnDeactivate is true', () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()

    const btn = document.createElement('button')
    container.appendChild(btn)

    const trap = createFocusScope(container, { moveFocus: true, returnFocus: true })
    trap.activate()
    expect(document.activeElement).toBe(btn)
    trap.deactivate()
    expect(document.activeElement).toBe(outside)

    outside.remove()
  })

  it('should call onEscape when Escape is pressed', () => {
    const onEscape = vi.fn()
    const btn = document.createElement('button')
    container.appendChild(btn)

    const trap = createFocusScope(container, { moveFocus: true, onEscape })
    trap.activate()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onEscape).toHaveBeenCalledOnce()

    trap.deactivate()
  })

  it('should wrap focus from last to first on Tab', () => {
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    container.append(btn1, btn2)

    const trap = createFocusScope(container, { moveFocus: true })
    trap.activate()

    btn2.focus()
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(event)
    expect(document.activeElement).toBe(btn1)

    trap.deactivate()
  })

  it('should wrap focus from first to last on Shift+Tab', () => {
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    container.append(btn1, btn2)

    const trap = createFocusScope(container, { moveFocus: true })
    trap.activate()

    btn1.focus()
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true
    })
    document.dispatchEvent(event)
    expect(document.activeElement).toBe(btn2)

    trap.deactivate()
  })

  it('should prevent Tab when the trap has no focusable elements', () => {
    const trap = createFocusScope(container, { moveFocus: true })
    trap.activate()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)

    trap.deactivate()
  })
})

describe('manageLiveRegion', () => {
  afterEach(() => {
    document.querySelectorAll('[data-tiger-live-region]').forEach((el) => el.remove())
  })

  it('gives each caller its own region', () => {
    const first = manageLiveRegion('polite')
    const second = manageLiveRegion('polite')
    expect(first.element).not.toBe(second.element)
    expect(first.element?.getAttribute('role')).toBe('status')
    expect(first.element?.getAttribute('aria-live')).toBe('polite')
    first.destroy()
    expect(first.element?.isConnected).toBe(false)
    expect(second.element?.isConnected).toBe(true)
    second.destroy()
  })

  it('keeps assertive as aria-live only', () => {
    const region = manageLiveRegion('assertive')
    expect(region.element?.getAttribute('aria-live')).toBe('assertive')
    expect(region.element?.getAttribute('role')).toBeNull()
    expect(region.element?.style.clipPath).toBe('inset(50%)')
    expect(region.element?.style.clip).toBe('')
    region.destroy()
  })

  it('should clear the region', () => {
    const region = manageLiveRegion('polite')
    region.announce('test')
    region.clear()
    expect(region.element?.textContent).toBe('')
    region.destroy()
  })

  it('cancels a pending announcement on destroy', async () => {
    const region = manageLiveRegion('polite')
    region.announce('later')
    region.destroy()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
    expect(region.element?.isConnected).toBe(false)
    expect(region.element?.textContent).toBe('')
  })
})
