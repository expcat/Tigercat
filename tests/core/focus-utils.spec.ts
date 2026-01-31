/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  captureActiveElement,
  focusElement,
  focusFirst,
  restoreFocus,
  isHTMLElement,
  getActiveElement
} from '@expcat/tigercat-core'

describe('focus-utils', () => {
  let cleanup: HTMLElement[] = []

  const createElement = (tag: string = 'button'): HTMLElement => {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    cleanup.push(el)
    return el
  }

  afterEach(() => {
    cleanup.forEach((el) => el.remove())
    cleanup = []
  })

  describe('isHTMLElement', () => {
    it('returns true for HTMLElement', () => {
      const el = document.createElement('div')
      expect(isHTMLElement(el)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isHTMLElement(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isHTMLElement(undefined)).toBe(false)
    })

    it('returns false for plain objects', () => {
      expect(isHTMLElement({})).toBe(false)
    })

    it('returns false for strings', () => {
      expect(isHTMLElement('div')).toBe(false)
    })

    it('returns false for numbers', () => {
      expect(isHTMLElement(123)).toBe(false)
    })
  })

  describe('getActiveElement', () => {
    it('returns the active element', () => {
      const btn = createElement('button')
      btn.focus()
      expect(getActiveElement(document)).toBe(btn)
    })

    it('returns null when no focusable element is active', () => {
      // Body is active by default, but it's not focusable in the same way
      const result = getActiveElement(document)
      // Result should be body or null depending on environment
      expect(result === null || result === document.body).toBe(true)
    })

    it('handles undefined document gracefully', () => {
      expect(getActiveElement(undefined)).toBe(null)
    })
  })

  describe('captureActiveElement', () => {
    it('captures the currently focused element', () => {
      const btn = createElement('button')
      btn.focus()
      const captured = captureActiveElement(document)
      expect(captured).toBe(btn)
    })

    it('returns null when nothing is focused', () => {
      document.body.focus()
      const captured = captureActiveElement(document)
      // May return body or null
      expect(captured === null || captured === document.body).toBe(true)
    })
  })

  describe('focusElement', () => {
    it('focuses an HTMLElement', () => {
      const btn = createElement('button')
      const result = focusElement(btn)
      expect(result).toBe(true)
      expect(document.activeElement).toBe(btn)
    })

    it('returns false for null', () => {
      expect(focusElement(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(focusElement(undefined)).toBe(false)
    })

    it('supports preventScroll option', () => {
      const btn = createElement('button')
      const result = focusElement(btn, { preventScroll: true })
      expect(result).toBe(true)
      expect(document.activeElement).toBe(btn)
    })

    it('returns false for element without focus method', () => {
      const fakeElement = { focus: undefined } as unknown as HTMLElement
      expect(focusElement(fakeElement)).toBe(false)
    })

    it('handles focus errors gracefully', () => {
      const fakeElement = {
        focus: () => {
          throw new Error('Focus failed')
        }
      } as unknown as HTMLElement
      expect(focusElement(fakeElement)).toBe(false)
    })
  })

  describe('focusFirst', () => {
    it('focuses the first non-null candidate', () => {
      const btn = createElement('button')
      const focused = focusFirst([null, undefined, btn])
      expect(focused).toBe(btn)
      expect(document.activeElement).toBe(btn)
    })

    it('returns the focused element', () => {
      const btn1 = createElement('button')
      const btn2 = createElement('button')
      const focused = focusFirst([btn1, btn2])
      expect(focused).toBe(btn1)
    })

    it('skips null and undefined candidates', () => {
      const btn = createElement('button')
      const focused = focusFirst([null, null, undefined, btn])
      expect(focused).toBe(btn)
    })

    it('returns null when no candidates can be focused', () => {
      const focused = focusFirst([null, undefined])
      expect(focused).toBe(null)
    })

    it('returns null for empty array', () => {
      const focused = focusFirst([])
      expect(focused).toBe(null)
    })

    it('supports preventScroll option', () => {
      const btn = createElement('button')
      const focused = focusFirst([btn], { preventScroll: true })
      expect(focused).toBe(btn)
    })
  })

  describe('restoreFocus', () => {
    it('restores focus to a previously captured element', () => {
      const a = createElement('button')
      const b = createElement('button')

      a.focus()
      const captured = captureActiveElement(document)

      b.focus()
      expect(document.activeElement).toBe(b)

      const restored = restoreFocus(captured)
      expect(restored).toBe(true)
      expect(document.activeElement).toBe(a)
    })

    it('returns false when previous is null', () => {
      expect(restoreFocus(null)).toBe(false)
    })

    it('returns false when previous is undefined', () => {
      expect(restoreFocus(undefined)).toBe(false)
    })

    it('supports preventScroll option', () => {
      const btn = createElement('button')
      btn.focus()
      const captured = captureActiveElement(document)

      createElement('button').focus()

      const restored = restoreFocus(captured, { preventScroll: true })
      expect(restored).toBe(true)
      expect(document.activeElement).toBe(btn)
    })
  })

  describe('integration scenarios', () => {
    it('handles modal focus trap pattern', () => {
      // Simulate: save focus → open modal → close modal → restore focus
      const trigger = createElement('button')
      trigger.focus()

      // Save focus before opening modal
      const savedFocus = captureActiveElement(document)
      expect(savedFocus).toBe(trigger)

      // Modal opens, focus moves to modal content
      const modalButton = createElement('button')
      focusElement(modalButton)
      expect(document.activeElement).toBe(modalButton)

      // Modal closes, restore focus
      const restored = restoreFocus(savedFocus)
      expect(restored).toBe(true)
      expect(document.activeElement).toBe(trigger)
    })

    it('handles dropdown focus pattern', () => {
      const trigger = createElement('button')
      const option1 = createElement('button')
      const option2 = createElement('button')
      const option3 = createElement('button')

      // Focus trigger
      focusElement(trigger)
      expect(document.activeElement).toBe(trigger)

      // Open dropdown, focus first option
      const focused = focusFirst([option1, option2, option3])
      expect(focused).toBe(option1)
    })
  })
})
