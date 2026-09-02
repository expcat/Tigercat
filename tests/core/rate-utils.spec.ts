/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getRateStarClasses,
  rateCharacterGlyphClasses,
  rateHalfStarInnerClasses
} from '@expcat/tigercat-core'

describe('rate-utils', () => {
  it('keeps the half-star inner glyph at full-star width', () => {
    expect(rateHalfStarInnerClasses).toContain('w-[200%]')
    expect(rateHalfStarInnerClasses).toContain('h-full')
  })

  it('gives character stars a sized host so half-star layers are not 0×0', () => {
    const classes = getRateStarClasses('md', true, false)
    expect(classes).toContain('w-5')
    expect(classes).toContain('h-5')
    expect(rateCharacterGlyphClasses).toContain('h-full')
    expect(rateCharacterGlyphClasses).toContain('w-full')
  })
})
