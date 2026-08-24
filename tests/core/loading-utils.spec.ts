/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { DEFAULT_LOADING_BACKGROUND } from '@expcat/tigercat-core'

const OLD_LOCKED_WHITE_MASK = 'rgba(255, 255, 255, 0.9)'

describe('Loading fullscreen mask default', () => {
  it('follows --tiger-surface at ~0.9 alpha instead of a locked light rgba', () => {
    expect(DEFAULT_LOADING_BACKGROUND).toContain('--tiger-surface')
    expect(DEFAULT_LOADING_BACKGROUND).toContain('--tiger-loading-mask')
    expect(DEFAULT_LOADING_BACKGROUND).toContain('color-mix')
    expect(DEFAULT_LOADING_BACKGROUND).not.toBe(OLD_LOCKED_WHITE_MASK)
    expect(DEFAULT_LOADING_BACKGROUND).not.toContain(OLD_LOCKED_WHITE_MASK)
    expect(DEFAULT_LOADING_BACKGROUND).toBe(
      'var(--tiger-loading-mask, color-mix(in srgb, var(--tiger-surface, #ffffff) 90%, transparent))'
    )
  })
})
