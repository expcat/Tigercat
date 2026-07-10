import { afterEach, describe, expect, it, vi } from 'vitest'
import * as animation from '../../packages/core/src/utils/animation'

const loadFreshAnimation = async () => {
  vi.resetModules()
  return import('../../packages/core/src/utils/animation')
}

describe('animation utilities', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('exports duration, easing, transition, and animation class constants', () => {
    expect(animation.ANIMATION_DURATION_MS).toBe(300)
    expect(animation.ANIMATION_DURATION_FAST_MS).toBe(200)
    expect(animation.ANIMATION_DURATION_SLOW_MS).toBe(500)
    expect(animation.DURATION_CLASS).toBe('duration-300')
    expect(animation.EASING_SPRING).toContain('cubic-bezier')
    expect(animation.TRANSITION_BASE).toContain('transition-all')
    expect(animation.TRANSITION_OPACITY).toContain('transition-opacity')
    expect(animation.TRANSITION_TRANSFORM).toContain('transition-transform')
    expect(animation.SHAKE_CLASS).toBe('tiger-animate-shake')
    expect(animation.SVG_ANIMATION_CLASSES.pathDraw).toBe('tiger-animate-path-draw')
    expect(animation.SVG_ANIMATION_VARS.pathLength).toBe('--tiger-path-length')
  })

  it('injects shake styles once and reuses an existing style element', async () => {
    const { injectShakeStyle } = await loadFreshAnimation()

    injectShakeStyle()
    injectShakeStyle()

    expect(document.querySelectorAll('#tiger-ui-animation-styles')).toHaveLength(1)
    expect(document.getElementById('tiger-ui-animation-styles')?.textContent).toContain(
      'tiger-shake'
    )
  })

  it('does not inject shake styles outside a browser environment', async () => {
    const originalWindow = globalThis.window
    vi.stubGlobal('window', undefined)
    const { injectShakeStyle } = await loadFreshAnimation()

    injectShakeStyle()

    vi.stubGlobal('window', originalWindow)
    expect(document.getElementById('tiger-ui-animation-styles')).toBeNull()
  })

  it('calculates path length and draw styles', () => {
    const { getPathLength, getPathDrawStyles } = animation
    const path = { getTotalLength: () => 128 } as SVGPathElement

    expect(getPathLength(path)).toBe(128)
    expect(getPathDrawStyles(200, 0)).toEqual({
      strokeDasharray: '200',
      strokeDashoffset: '200'
    })
    expect(getPathDrawStyles(200, 0.25)).toEqual({
      strokeDasharray: '200',
      strokeDashoffset: '150'
    })
    expect(getPathDrawStyles(200, 1)).toEqual({
      strokeDasharray: '200',
      strokeDashoffset: '0'
    })
  })

  it('injects SVG animation styles once', async () => {
    const { injectSvgAnimationStyles } = await loadFreshAnimation()

    injectSvgAnimationStyles()
    injectSvgAnimationStyles()

    expect(document.querySelectorAll('#tiger-ui-svg-animation-styles')).toHaveLength(1)
    expect(document.getElementById('tiger-ui-svg-animation-styles')?.textContent).toContain(
      'tiger-path-draw'
    )
  })

  it('does not inject SVG animation styles outside a browser environment', async () => {
    const originalWindow = globalThis.window
    vi.stubGlobal('window', undefined)
    const { injectSvgAnimationStyles } = await loadFreshAnimation()

    injectSvgAnimationStyles()

    vi.stubGlobal('window', originalWindow)
    expect(document.getElementById('tiger-ui-svg-animation-styles')).toBeNull()
  })

  it('creates animation style objects with defaults and custom values', () => {
    const {
      SVG_ANIMATION_VARS,
      getPathDrawAnimationStyle,
      getBarGrowAnimationStyle,
      getPieDrawAnimationStyle
    } = animation

    expect(getPathDrawAnimationStyle(240)).toEqual({
      [SVG_ANIMATION_VARS.pathLength]: '240',
      [SVG_ANIMATION_VARS.pathDuration]: '1000ms'
    })
    expect(getPathDrawAnimationStyle(240, 650)).toEqual({
      [SVG_ANIMATION_VARS.pathLength]: '240',
      [SVG_ANIMATION_VARS.pathDuration]: '650ms'
    })
    expect(getBarGrowAnimationStyle(3)).toEqual({
      [SVG_ANIMATION_VARS.barDuration]: '500ms',
      animationDelay: '150ms'
    })
    expect(getBarGrowAnimationStyle(2, 800, 75)).toEqual({
      [SVG_ANIMATION_VARS.barDuration]: '800ms',
      animationDelay: '150ms'
    })
    expect(getPieDrawAnimationStyle(360, 90)).toEqual({
      [SVG_ANIMATION_VARS.circumference]: '360',
      [SVG_ANIMATION_VARS.targetOffset]: '90',
      [SVG_ANIMATION_VARS.pieDuration]: '800ms'
    })
  })

  it('resolves token-backed component motion styles and transitions', () => {
    const {
      COMPONENT_MOTION_VARS,
      getComponentMotionStyle,
      getComponentMotionTransition,
      resolveMotionDuration,
      resolveMotionEasing
    } = animation

    expect(resolveMotionDuration('slow')).toBe('var(--tiger-motion-duration-slow,450ms)')
    expect(resolveMotionDuration(125)).toBe('125ms')
    expect(resolveMotionEasing('spring')).toBe(
      'var(--tiger-motion-ease-spring,cubic-bezier(0.34, 1.56, 0.64, 1))'
    )

    const style = getComponentMotionStyle({
      duration: 'relaxed',
      easing: 'emphasized',
      direction: 'up'
    })
    expect(style[COMPONENT_MOTION_VARS.duration]).toBe('var(--tiger-motion-duration-relaxed,300ms)')
    expect(style[COMPONENT_MOTION_VARS.translateY]).toBe('0.5rem')
    expect(getComponentMotionTransition(['opacity', 'transform'], { duration: 180 })).toContain(
      'opacity 180ms'
    )
  })

  it('collapses component motion, stagger, and sequence timing when disabled', () => {
    const {
      COMPONENT_MOTION_VARS,
      getComponentMotionStyle,
      getStaggerDelay,
      getStaggeredMotionStyle,
      createMotionSequence
    } = animation

    expect(getComponentMotionStyle({ disabled: true })[COMPONENT_MOTION_VARS.duration]).toBe('0ms')
    expect(getStaggerDelay(3, { disabled: true })).toBe('0ms')
    expect(getStaggeredMotionStyle(2, { disabled: true }).animationDelay).toBe('0ms')

    expect(
      createMotionSequence([{ id: 'panel' }, { id: 'items', durationMs: 300 }], { disabled: true })
    ).toEqual([
      expect.objectContaining({ id: 'panel', startMs: 0, durationMs: 0, gapAfterMs: 0 }),
      expect.objectContaining({ id: 'items', startMs: 0, durationMs: 0, gapAfterMs: 0 })
    ])
  })

  it('creates staggered and sequenced animation timing styles', () => {
    const {
      COMPONENT_MOTION_VARS,
      getStaggerDelay,
      getStaggeredMotionStyle,
      createMotionSequence
    } = animation

    expect(getStaggerDelay(3, { stepMs: 25, initialDelayMs: 10 })).toBe('85ms')
    expect(getStaggeredMotionStyle(2, { stepMs: 30 }).animationDelay).toBe('60ms')

    const sequence = createMotionSequence(
      [{ id: 'overlay' }, { id: 'panel', durationMs: 300, gapAfterMs: 20 }],
      { durationMs: 200, gapMs: 50, initialDelayMs: 15 }
    )

    expect(sequence[0]).toEqual(
      expect.objectContaining({
        id: 'overlay',
        index: 0,
        startMs: 15,
        durationMs: 200,
        gapAfterMs: 50
      })
    )
    expect(sequence[1]?.style[COMPONENT_MOTION_VARS.delay]).toBe('265ms')
  })

  it('runs View Transition callbacks through the browser API when available', async () => {
    const {
      injectViewTransitionStyles,
      startTigercatViewTransition,
      supportsViewTransitions,
      getViewTransitionNameStyle
    } = await loadFreshAnimation()

    const transition = {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn()
    }
    const startViewTransition = vi.fn((callback: () => void) => {
      callback()
      return transition
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true
    })

    const update = vi.fn()
    await expect(startTigercatViewTransition(update)).resolves.toBe(transition)
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledTimes(1)
    expect(supportsViewTransitions()).toBe(true)
    expect(getViewTransitionNameStyle('route-main')).toEqual({ viewTransitionName: 'route-main' })

    injectViewTransitionStyles()
    injectViewTransitionStyles()
    expect(document.querySelectorAll('#tiger-ui-view-transition-styles')).toHaveLength(1)
  })

  it('falls back to direct updates when View Transitions are unavailable', async () => {
    const { startTigercatViewTransition } = animation
    Object.defineProperty(document, 'startViewTransition', {
      value: undefined,
      configurable: true
    })

    const update = vi.fn()
    await expect(startTigercatViewTransition(update)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledTimes(1)
  })
})
