/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { rateHalfStarInnerClasses } from '@expcat/tigercat-core'

describe('rate-utils', () => {
  it('keeps the half-star inner glyph at full-star width', () => {
    expect(rateHalfStarInnerClasses).toContain('w-[200%]')
    expect(rateHalfStarInnerClasses).toContain('h-full')
  })
})
