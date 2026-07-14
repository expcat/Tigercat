/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  getFocusableElements,
  getFocusTrapNavigation,
  isEventOutside,
  registerEscapeDismiss,
  shouldCloseOnMaskClick
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
})
