import { describe, expect, it } from 'vitest'
import { captureActiveElement, focusElement, focusFirst, restoreFocus } from '@expcat/tigercat-core'

describe('focus-utils', () => {
  it('captures and restores the active element', () => {
    const a = document.createElement('button')
    const b = document.createElement('button')
    a.textContent = 'a'
    b.textContent = 'b'
    document.body.appendChild(a)
    document.body.appendChild(b)

    a.focus()
    const captured = captureActiveElement(document)

    b.focus()
    const restored = restoreFocus(captured)

    expect(restored).toBe(true)
    expect(document.activeElement).toBe(a)
  })

  it('focusFirst focuses the first focusable candidate', () => {
    const btn = document.createElement('button')
    document.body.appendChild(btn)

    const focused = focusFirst([null, undefined, btn])

    expect(focused).toBe(btn)
    expect(document.activeElement).toBe(btn)
  })

  it('focusElement returns false for null', () => {
    expect(focusElement(null)).toBe(false)
  })
})
