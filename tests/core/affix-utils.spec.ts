/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { calculateAffixState } from '@expcat/tigercat-core'

describe('calculateAffixState', () => {
  it('window-like container keeps offsetBottom as viewport bottom offset', () => {
    const result = calculateAffixState(
      { top: 550, left: 10, width: 200, height: 40 },
      { top: 0, bottom: 600 },
      undefined,
      16,
      10,
      600
    )

    expect(result.affixed).toBe(true)
    expect(result.style).toMatchObject({
      position: 'fixed',
      bottom: '16px',
      left: '10px',
      width: '200px',
      zIndex: 10
    })
  })

  it('custom target offsetBottom is innerHeight - containerRect.bottom + offset', () => {
    const result = calculateAffixState(
      { top: 140, left: 10, width: 200, height: 40 },
      { top: 20, bottom: 180 },
      undefined,
      8,
      10,
      200
    )

    expect(result.affixed).toBe(true)
    expect(result.style.bottom).toBe('28px')
    expect(result.style.bottom).not.toBe('8px')
    expect(result.style.position).toBe('fixed')
  })

  it('custom target offsetTop still uses containerRect.top + offset', () => {
    const result = calculateAffixState(
      { top: 20, left: 10, width: 200, height: 40 },
      { top: 20, bottom: 180 },
      8,
      undefined,
      10,
      200
    )

    expect(result.affixed).toBe(true)
    expect(result.style.top).toBe('28px')
    expect(result.style.bottom).toBeUndefined()
  })
})
