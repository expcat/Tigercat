/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getSkeletonClasses,
  skeletonAnimationClasses,
  skeletonBaseClasses
} from '@expcat/tigercat-core'

const OLD_LOCKED_SKELETON_BG = '--tiger-skeleton-bg,#e5e7eb'
const OLD_LOCKED_SKELETON_BG_ALT = '--tiger-skeleton-bg-alt,#d1d5db'

describe('skeleton-utils surface-muted bars', () => {
  it('falls back to registered surface-muted for the bar, not fill or locked gray-200', () => {
    expect(skeletonBaseClasses).toContain('--tiger-surface-muted')
    expect(skeletonBaseClasses).toContain('--tiger-skeleton-bg')
    expect(skeletonBaseClasses).not.toContain('--tiger-fill')
    expect(skeletonBaseClasses).not.toContain(OLD_LOCKED_SKELETON_BG)
    expect(skeletonBaseClasses).not.toContain('--tiger-component-skeleton')

    const classes = getSkeletonClasses()
    expect(classes).toContain('--tiger-surface-muted')
    expect(classes).toContain(skeletonBaseClasses)
    expect(classes).not.toContain('--tiger-fill')
    expect(classes).not.toContain(OLD_LOCKED_SKELETON_BG)
  })

  it('uses the same surface-muted chain for wave from/to, not locked gray-200', () => {
    const wave = skeletonAnimationClasses.wave
    expect(wave).toContain('--tiger-surface-muted')
    expect(wave).toContain('from-[var(--tiger-skeleton-bg,var(--tiger-surface-muted')
    expect(wave).toContain('to-[var(--tiger-skeleton-bg,var(--tiger-surface-muted')
    expect(wave).not.toContain(OLD_LOCKED_SKELETON_BG)
    expect(wave).not.toContain('--tiger-fill')

    const classes = getSkeletonClasses('text', 'wave')
    expect(classes).toContain('--tiger-surface-muted')
    expect(classes).toContain(wave)
    expect(classes).not.toContain(OLD_LOCKED_SKELETON_BG)
  })

  it('does not lock wave via to gray-300', () => {
    const wave = skeletonAnimationClasses.wave
    expect(wave).not.toContain('#d1d5db')
    expect(wave).not.toContain(OLD_LOCKED_SKELETON_BG_ALT)
    expect(wave).toContain('--tiger-skeleton-bg-alt')
  })
})
