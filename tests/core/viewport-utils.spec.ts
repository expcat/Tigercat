/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import {
  getViewportWidth,
  isMobile,
  isTablet,
  TIGER_VIEWPORT_BREAKPOINTS
} from '@expcat/tigercat-core'

describe('viewport-utils', () => {
  it('uses explicit width for SSR-friendly checks', () => {
    expect(getViewportWidth({ width: 375 })).toBe(375)
    expect(isMobile({ width: 767 })).toBe(true)
    expect(isMobile({ width: 768 })).toBe(false)
    expect(isTablet({ width: 768 })).toBe(true)
    expect(isTablet({ width: 1024 })).toBe(false)
  })

  it('aligns breakpoints with Tailwind defaults used by Tigercat', () => {
    expect(TIGER_VIEWPORT_BREAKPOINTS.sm).toBe(640)
    expect(TIGER_VIEWPORT_BREAKPOINTS.md).toBe(768)
    expect(TIGER_VIEWPORT_BREAKPOINTS.lg).toBe(1024)
    expect(TIGER_VIEWPORT_BREAKPOINTS.xl).toBe(1280)
  })
})
