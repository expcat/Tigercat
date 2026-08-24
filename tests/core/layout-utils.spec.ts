/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { getLayoutContentClasses, layoutContentClasses } from '@expcat/tigercat-core'

const OLD_LOCKED_CONTENT_BG = '--tiger-layout-content-bg,#f9fafb'

describe('layout-utils Content surface-muted fallback', () => {
  it('falls back to registered surface-muted, not fill or locked layout-content-bg hex', () => {
    expect(layoutContentClasses).toContain('--tiger-surface-muted')
    expect(layoutContentClasses).toContain('--tiger-layout-content-bg')
    expect(layoutContentClasses).toContain('--tiger-layout-content-bg,var(--tiger-surface-muted')
    expect(layoutContentClasses).not.toContain('--tiger-fill')
    expect(layoutContentClasses).not.toContain(OLD_LOCKED_CONTENT_BG)

    const classes = getLayoutContentClasses()
    expect(classes).toContain('--tiger-surface-muted')
    expect(classes).toContain('--tiger-layout-content-bg')
    expect(classes).toContain('--tiger-layout-content-bg,var(--tiger-surface-muted')
    expect(classes).toContain(layoutContentClasses)
    expect(classes).not.toContain('--tiger-fill')
    expect(classes).not.toContain(OLD_LOCKED_CONTENT_BG)

    const overrideIdx = layoutContentClasses.indexOf('--tiger-layout-content-bg')
    const semanticIdx = layoutContentClasses.indexOf('--tiger-surface-muted')
    expect(overrideIdx).toBeGreaterThan(-1)
    expect(semanticIdx).toBeGreaterThan(overrideIdx)
  })
})
