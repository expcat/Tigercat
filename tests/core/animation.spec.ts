import { afterEach, describe, expect, it, vi } from 'vitest'

const loadAnimation = async () => {
  vi.resetModules()
  return import('@expcat/tigercat-core')
}

describe('animation utilities', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('exports duration, easing, transition, and animation class constants', async () => {
    const animation = await loadAnimation()

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
    const { injectShakeStyle } = await loadAnimation()

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
    const { injectShakeStyle } = await loadAnimation()

    injectShakeStyle()

    vi.stubGlobal('window', originalWindow)
    expect(document.getElementById('tiger-ui-animation-styles')).toBeNull()
  })

  it('calculates path length and draw styles', async () => {
    const { getPathLength, getPathDrawStyles } = await loadAnimation()
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
    const { injectSvgAnimationStyles } = await loadAnimation()

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
    const { injectSvgAnimationStyles } = await loadAnimation()

    injectSvgAnimationStyles()

    vi.stubGlobal('window', originalWindow)
    expect(document.getElementById('tiger-ui-svg-animation-styles')).toBeNull()
  })

  it('creates animation style objects with defaults and custom values', async () => {
    const {
      SVG_ANIMATION_VARS,
      getPathDrawAnimationStyle,
      getBarGrowAnimationStyle,
      getPieDrawAnimationStyle
    } = await loadAnimation()

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
})
