/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import { qrColorContrast, qrNeedsContrastWarning } from '@expcat/tigercat-core'

describe('qr contrast against live tokens', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--tiger-text')
    document.documentElement.style.removeProperty('--tiger-surface')
  })

  it('warns when overridden theme tokens are the same color', () => {
    document.documentElement.style.setProperty('--tiger-text', '#ffffff')
    document.documentElement.style.setProperty('--tiger-surface', '#ffffff')

    expect(qrColorContrast('var(--tiger-text)', 'var(--tiger-surface)')).toBe(1)
    expect(qrNeedsContrastWarning('var(--tiger-text)', 'var(--tiger-surface)')).toBe(true)
  })
})
