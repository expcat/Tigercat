/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getSkeletonClasses,
  getSkeletonInlineStyle,
  resolveSkeletonAriaHidden,
  skeletonAnimationClasses,
  skeletonBaseClasses,
  skeletonVariantSizeClasses
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

  it('uses the same surface-muted chain for wave, not locked gray-200', () => {
    const wave = skeletonAnimationClasses.wave
    expect(wave).not.toContain('animate-pulse')
    expect(wave).toContain('tiger-skeleton-wave')
    expect(wave).toContain('tiger-motion-aware')
    expect(wave).not.toContain(OLD_LOCKED_SKELETON_BG)
    expect(wave).not.toContain('--tiger-fill')

    const classes = getSkeletonClasses('text', 'wave')
    expect(classes).toContain('tiger-skeleton-wave')
    expect(classes).not.toContain('animate-pulse')
    expect(classes).not.toContain(OLD_LOCKED_SKELETON_BG)
  })

  it('does not lock wave via to gray-300', () => {
    const wave = skeletonAnimationClasses.wave
    expect(wave).not.toContain('#d1d5db')
    expect(wave).not.toContain(OLD_LOCKED_SKELETON_BG_ALT)
  })

  it('keeps pulse as opacity motion, also reduced-motion aware', () => {
    expect(skeletonAnimationClasses.pulse).toContain('tiger-skeleton-pulse')
    expect(skeletonAnimationClasses.pulse).toContain('tiger-motion-aware')
    expect(skeletonAnimationClasses.pulse).not.toContain('tiger-skeleton-wave')
  })
})

describe('skeleton sizing', () => {
  it('does not inline default width or height', () => {
    expect(getSkeletonInlineStyle()).toBeUndefined()
    expect(getSkeletonInlineStyle(undefined, undefined)).toBeUndefined()
  })

  it('only inlines caller width and height', () => {
    expect(getSkeletonInlineStyle('80%', '32px')).toEqual({ width: '80%', height: '32px' })
    expect(getSkeletonInlineStyle(undefined, '32px')).toEqual({ height: '32px' })
  })

  it('gives custom no default size and skips size classes when props are set', () => {
    expect(skeletonVariantSizeClasses.custom).toEqual({})
    const custom = getSkeletonClasses('custom')
    expect(custom).not.toContain('h-4')
    expect(custom).not.toContain('w-full')

    const withHeight = getSkeletonClasses('text', 'pulse', 'circle', { height: '32px' })
    expect(withHeight).not.toContain('h-4')
  })
})

describe('resolveSkeletonAriaHidden', () => {
  it('treats string false as visible, matching React', () => {
    expect(resolveSkeletonAriaHidden('false', false)).toBe(false)
    expect(resolveSkeletonAriaHidden('true', false)).toBe(true)
    expect(resolveSkeletonAriaHidden(undefined, false)).toBe(true)
    expect(resolveSkeletonAriaHidden(undefined, true)).toBeUndefined()
  })
})
