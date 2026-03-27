/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  createAriaId,
  createFocusTrap,
  announceToScreenReader,
  manageLiveRegion,
  isActivationKey,
  isEnterKey,
  isEscapeKey,
  isSpaceKey,
  isTabKey
} from '@expcat/tigercat-core'

describe('a11y-utils (core)', () => {
  it('createAriaId should generate unique ids with default prefix', () => {
    const id1 = createAriaId()
    const id2 = createAriaId()

    expect(id1).toMatch(/^tigercat-\d+$/)
    expect(id2).toMatch(/^tigercat-\d+$/)
    expect(id1).not.toEqual(id2)
  })

  it('createAriaId should support custom prefix and separator', () => {
    const id = createAriaId({ prefix: 'tiger', separator: '_' })
    expect(id).toMatch(/^tiger_\d+$/)
  })

  it('key helpers should detect Enter', () => {
    expect(isEnterKey({ key: 'Enter' })).toBe(true)
    expect(isEnterKey({ code: 'Enter' })).toBe(true)
    expect(isEnterKey({ keyCode: 13 })).toBe(true)
    expect(isEnterKey({ key: ' ' })).toBe(false)
  })

  it('key helpers should detect Space', () => {
    expect(isSpaceKey({ key: ' ' })).toBe(true)
    expect(isSpaceKey({ key: 'Spacebar' })).toBe(true)
    expect(isSpaceKey({ code: 'Space' })).toBe(true)
    expect(isSpaceKey({ keyCode: 32 })).toBe(true)
    expect(isSpaceKey({ key: 'Enter' })).toBe(false)
  })

  it('isActivationKey should detect Enter or Space', () => {
    expect(isActivationKey({ key: 'Enter' })).toBe(true)
    expect(isActivationKey({ key: ' ' })).toBe(true)
    expect(isActivationKey({ key: 'Escape' })).toBe(false)
  })

  it('key helpers should detect Escape', () => {
    expect(isEscapeKey({ key: 'Escape' })).toBe(true)
    expect(isEscapeKey({ code: 'Escape' })).toBe(true)
    expect(isEscapeKey({ keyCode: 27 })).toBe(true)
    expect(isEscapeKey({ key: 'Enter' })).toBe(false)
  })

  it('key helpers should detect Tab', () => {
    expect(isTabKey({ key: 'Tab' })).toBe(true)
    expect(isTabKey({ code: 'Tab' })).toBe(true)
    expect(isTabKey({ keyCode: 9 })).toBe(true)
    expect(isTabKey({ key: 'Enter' })).toBe(false)
  })
})

describe('createFocusTrap', () => {
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

    const trap = createFocusTrap(container)
    trap.activate()
    expect(document.activeElement).toBe(btn1)
    trap.deactivate()
  })

  it('should focus initialFocus element when provided', () => {
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    container.append(btn1, btn2)

    const trap = createFocusTrap(container, { initialFocus: btn2 })
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

    const trap = createFocusTrap(container, { returnFocusOnDeactivate: true })
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

    const trap = createFocusTrap(container, { escapeDeactivates: true, onEscape })
    trap.activate()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onEscape).toHaveBeenCalledOnce()

    trap.deactivate()
  })

  it('should wrap focus from last to first on Tab', () => {
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    container.append(btn1, btn2)

    const trap = createFocusTrap(container)
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

    const trap = createFocusTrap(container)
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
})

describe('announceToScreenReader', () => {
  afterEach(() => {
    document.querySelectorAll('[id^="tigercat-live-region"]').forEach((el) => el.remove())
  })

  it('should create a live region and set message', async () => {
    announceToScreenReader('Hello')
    const region = document.getElementById('tigercat-live-region-polite')
    expect(region).toBeTruthy()
    expect(region!.getAttribute('aria-live')).toBe('polite')
    expect(region!.getAttribute('role')).toBe('status')
  })

  it('should use assertive level with alert role', () => {
    announceToScreenReader('Urgent!', 'assertive')
    const region = document.getElementById('tigercat-live-region-assertive')
    expect(region).toBeTruthy()
    expect(region!.getAttribute('aria-live')).toBe('assertive')
    expect(region!.getAttribute('role')).toBe('alert')
  })

  it('should visually hide the live region', () => {
    announceToScreenReader('Hidden text')
    const region = document.getElementById('tigercat-live-region-polite')
    expect(region!.style.position).toBe('absolute')
    expect(region!.style.overflow).toBe('hidden')
  })
})

describe('manageLiveRegion', () => {
  afterEach(() => {
    document.querySelectorAll('[id^="tigercat-live-region"]').forEach((el) => el.remove())
  })

  it('should clear the region', () => {
    const region = manageLiveRegion('polite')
    region.announce('test')
    region.clear()
    const el = document.getElementById('tigercat-live-region-polite')
    expect(el!.textContent).toBe('')
  })

  it('should destroy the region element', () => {
    const region = manageLiveRegion('polite')
    region.destroy()
    expect(document.getElementById('tigercat-live-region-polite')).toBeNull()
  })
})
