/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_MARQUEE_ARIA_LABEL,
  DEFAULT_MARQUEE_DIRECTION,
  DEFAULT_MARQUEE_DURATION_MS,
  DEFAULT_MARQUEE_GAP_PX,
  DEFAULT_MARQUEE_REPEAT,
  MAX_MARQUEE_REPEAT,
  MARQUEE_COPIES_VAR,
  MARQUEE_CSS,
  MARQUEE_DURATION_VAR,
  MARQUEE_GAP_VAR,
  MARQUEE_STYLE_ID,
  getMarqueeContentClasses,
  getMarqueeRootClasses,
  getMarqueeTrackClasses,
  getMarqueeTrackStyle,
  isMarqueeFocusInside,
  isMarqueePaused,
  isMarqueeReverse,
  isMarqueeVertical,
  marqueeCloneClasses,
  marqueePauseHoverClasses,
  marqueeReverseClasses,
  marqueeStaticClasses,
  resolveMarqueeAriaLabel,
  resolveMarqueeDirection,
  resolveMarqueeDuration,
  resolveMarqueeGap,
  resolveMarqueePauseOnHover,
  resolveMarqueeRepeat,
  shouldLoopMarquee
} from '@expcat/tigercat-core'

const loadFreshMarqueeUtils = async () => {
  vi.resetModules()
  return import('../../packages/core/src/utils/marquee-utils')
}

describe('marquee-utils', () => {
  afterEach(() => {
    document.getElementById(MARQUEE_STYLE_ID)?.remove()
    vi.unstubAllGlobals()
  })

  describe('resolveMarqueeDirection', () => {
    it('accepts known directions and falls back otherwise', () => {
      expect(resolveMarqueeDirection('left')).toBe('left')
      expect(resolveMarqueeDirection('right')).toBe('right')
      expect(resolveMarqueeDirection('up')).toBe('up')
      expect(resolveMarqueeDirection('down')).toBe('down')
      expect(resolveMarqueeDirection()).toBe(DEFAULT_MARQUEE_DIRECTION)
      expect(resolveMarqueeDirection('diagonal' as never)).toBe(DEFAULT_MARQUEE_DIRECTION)
    })

    it('treats up/down as vertical and right/down as reverse', () => {
      expect(isMarqueeVertical('left')).toBe(false)
      expect(isMarqueeVertical('up')).toBe(true)
      expect(isMarqueeReverse('left')).toBe(false)
      expect(isMarqueeReverse('right')).toBe(true)
      expect(isMarqueeReverse('down')).toBe(true)
    })
  })

  describe('resolveMarqueeDuration / gap / repeat', () => {
    it('emits a CSS time and falls back for non-positive values', () => {
      expect(resolveMarqueeDuration(12000)).toBe('12000ms')
      expect(resolveMarqueeDuration()).toBe(`${DEFAULT_MARQUEE_DURATION_MS}ms`)
      expect(resolveMarqueeDuration(0)).toBe(`${DEFAULT_MARQUEE_DURATION_MS}ms`)
      expect(resolveMarqueeDuration(-1)).toBe(`${DEFAULT_MARQUEE_DURATION_MS}ms`)
      expect(resolveMarqueeDuration(Number.NaN)).toBe(`${DEFAULT_MARQUEE_DURATION_MS}ms`)
    })

    it('emits a CSS length for gap', () => {
      expect(resolveMarqueeGap(24)).toBe('24px')
      expect(resolveMarqueeGap(0)).toBe('0px')
      expect(resolveMarqueeGap('1.5rem')).toBe('1.5rem')
      expect(resolveMarqueeGap('  8px  ')).toBe('8px')
      expect(resolveMarqueeGap()).toBe(`${DEFAULT_MARQUEE_GAP_PX}px`)
      expect(resolveMarqueeGap('')).toBe(`${DEFAULT_MARQUEE_GAP_PX}px`)
      expect(resolveMarqueeGap(-4)).toBe(`${DEFAULT_MARQUEE_GAP_PX}px`)
    })

    it('floors and clamps repeat, and requires 2 copies to loop', () => {
      expect(resolveMarqueeRepeat()).toBe(DEFAULT_MARQUEE_REPEAT)
      expect(resolveMarqueeRepeat(4)).toBe(4)
      expect(resolveMarqueeRepeat(1.8)).toBe(1)
      expect(resolveMarqueeRepeat(0)).toBe(DEFAULT_MARQUEE_REPEAT)
      expect(resolveMarqueeRepeat(99)).toBe(MAX_MARQUEE_REPEAT)
      expect(shouldLoopMarquee(2)).toBe(true)
      expect(shouldLoopMarquee(1)).toBe(false)
    })
  })

  describe('pause helpers', () => {
    it('pauses only when pauseOnHover is on and the region is hovered or focused', () => {
      expect(isMarqueePaused({ pauseOnHover: true, hovered: true })).toBe(true)
      expect(isMarqueePaused({ pauseOnHover: true, focused: true })).toBe(true)
      expect(isMarqueePaused({ pauseOnHover: true, hovered: false, focused: false })).toBe(false)
      expect(isMarqueePaused({ pauseOnHover: false, hovered: true, focused: true })).toBe(false)
      expect(resolveMarqueePauseOnHover()).toBe(true)
      expect(resolveMarqueePauseOnHover(false)).toBe(false)
    })

    it('detects whether focus is still inside the root', () => {
      const root = document.createElement('div')
      const child = document.createElement('button')
      const outside = document.createElement('span')
      root.appendChild(child)
      expect(isMarqueeFocusInside(root, child)).toBe(true)
      expect(isMarqueeFocusInside(root, outside)).toBe(false)
      expect(isMarqueeFocusInside(root, null)).toBe(false)
    })
  })

  describe('aria label', () => {
    it('trims custom labels and falls back to the default', () => {
      expect(resolveMarqueeAriaLabel('  News ticker  ')).toBe('News ticker')
      expect(resolveMarqueeAriaLabel('')).toBe(DEFAULT_MARQUEE_ARIA_LABEL)
      expect(resolveMarqueeAriaLabel()).toBe(DEFAULT_MARQUEE_ARIA_LABEL)
    })
  })

  describe('class and style builders', () => {
    it('marks reverse, pause-on-hover, and static single-copy roots', () => {
      const root = getMarqueeRootClasses({
        direction: 'right',
        pauseOnHover: true,
        repeat: 2,
        className: 'extra'
      })
      expect(root).toContain('tiger-marquee')
      expect(root).toContain(marqueeReverseClasses)
      expect(root).toContain(marqueePauseHoverClasses)
      expect(root).toContain('extra')
      expect(root).not.toContain(marqueeStaticClasses)

      expect(getMarqueeRootClasses({ repeat: 1 })).toContain(marqueeStaticClasses)
      expect(getMarqueeRootClasses({ pauseOnHover: false })).not.toContain(marqueePauseHoverClasses)
    })

    it('switches track and content layout for vertical direction', () => {
      expect(getMarqueeTrackClasses('up')).toContain('flex-col')
      expect(getMarqueeContentClasses({ direction: 'up', clone: true })).toContain(
        marqueeCloneClasses
      )
      expect(getMarqueeContentClasses({ clone: false })).not.toContain(marqueeCloneClasses)
    })

    it('writes duration, copies, and gap as CSS variables', () => {
      const style = getMarqueeTrackStyle({ duration: 8000, gap: 12, repeat: 3 })
      expect(style[MARQUEE_DURATION_VAR]).toBe('8000ms')
      expect(style[MARQUEE_COPIES_VAR]).toBe('3')
      expect(style[MARQUEE_GAP_VAR]).toBe('12px')
    })
  })

  describe('MARQUEE_CSS', () => {
    it('defines looping keyframes, hover pause, and reduced-motion freeze', () => {
      expect(MARQUEE_CSS).toContain('@keyframes tiger-marquee-x')
      expect(MARQUEE_CSS).toContain('@keyframes tiger-marquee-y')
      expect(MARQUEE_CSS).toContain('animation-play-state: paused')
      expect(MARQUEE_CSS).toContain('@media (prefers-reduced-motion: reduce)')
      expect(MARQUEE_CSS).toContain('animation: none !important')
      expect(MARQUEE_CSS).toContain('.tiger-marquee-clone')
    })
  })

  describe('injectMarqueeStyles', () => {
    it('injects looping styles once and reuses an existing style element', async () => {
      const { injectMarqueeStyles } = await loadFreshMarqueeUtils()

      injectMarqueeStyles()
      injectMarqueeStyles()

      expect(document.querySelectorAll(`#${MARQUEE_STYLE_ID}`)).toHaveLength(1)
      expect(document.getElementById(MARQUEE_STYLE_ID)?.textContent).toContain('tiger-marquee-x')
    })

    it('does not inject styles outside a browser environment', async () => {
      const originalWindow = globalThis.window
      vi.stubGlobal('window', undefined)
      const { injectMarqueeStyles } = await loadFreshMarqueeUtils()

      injectMarqueeStyles()

      vi.stubGlobal('window', originalWindow)
      expect(document.getElementById(MARQUEE_STYLE_ID)).toBeNull()
    })
  })
})
