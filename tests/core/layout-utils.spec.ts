/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  getLayoutContentClasses,
  getLayoutHeaderClasses,
  getLayoutRootClasses,
  getLayoutSidebarClasses,
  getSidebarStyle,
  injectLayoutGridStyles,
  isCssLengthZero,
  isSidebarFullyHidden,
  LAYOUT_GRID_STYLE_ID,
  layoutContentClasses,
  resetGridBreakpointSync,
  resolveLayoutHasSider,
  resolveSidebarAriaProps
} from '@expcat/tigercat-core'

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

describe('layout root direction and height', () => {
  it('uses a column shell by default without a viewport min-height', () => {
    const classes = getLayoutRootClasses()
    expect(classes).toContain('tiger-layout')
    expect(classes).not.toContain('tiger-flex-row')
    expect(classes).not.toContain('tiger-layout-full')
    expect(classes).not.toContain('min-h-screen')
  })

  it('places a sider shell on the row axis and skips a second viewport height when nested', () => {
    expect(getLayoutRootClasses({ hasSider: true })).toContain('tiger-flex-row')
    expect(getLayoutRootClasses({ nested: true, fullHeight: true })).toContain(
      'tiger-layout-nested'
    )
    expect(getLayoutRootClasses({ nested: true, fullHeight: true })).not.toContain(
      'tiger-layout-full'
    )
    expect(getLayoutRootClasses({ fullHeight: true })).toContain('tiger-layout-full')
  })

  it('resolves hasSider from the explicit prop, then direction, then child detection', () => {
    expect(resolveLayoutHasSider({ hasSider: false, childIsSider: true })).toBe(false)
    expect(resolveLayoutHasSider({ direction: 'horizontal', childIsSider: false })).toBe(true)
    expect(resolveLayoutHasSider({ direction: 'vertical', childIsSider: true })).toBe(false)
    expect(resolveLayoutHasSider({ childIsSider: true })).toBe(true)
  })
})

describe('header variants', () => {
  it('replaces the opaque default surface on glass variants', () => {
    const def = getLayoutHeaderClasses('default')
    const glass = getLayoutHeaderClasses('translucent')
    const blur = getLayoutHeaderClasses('blur')
    expect(def).toContain('tiger-header-default')
    expect(def).not.toContain('tiger-header-translucent')
    expect(glass).toContain('tiger-header-translucent')
    expect(glass).not.toContain('tiger-header-default')
    expect(blur).toContain('tiger-header-blur')
    expect(blur).toContain('z-[200]')
  })
})

describe('sidebar width and hide', () => {
  it('does not write inline width until a width prop or collapsed state is passed', () => {
    expect(getSidebarStyle(false)).toEqual({})
    expect(getSidebarStyle(false, '192px')).toEqual({ width: '192px', minWidth: '192px' })
    expect(getSidebarStyle(true, '256px', '80px')).toEqual({ width: '80px', minWidth: '80px' })
  })

  it('treats a collapsed 0-length as fully hidden', () => {
    expect(isCssLengthZero('0px')).toBe(true)
    expect(isCssLengthZero('0')).toBe(true)
    expect(isSidebarFullyHidden(true, '0px')).toBe(true)
    expect(isSidebarFullyHidden(true, '64px')).toBe(false)
    expect(isSidebarFullyHidden(false, '0px')).toBe(false)
    expect(getLayoutSidebarClasses({ side: 'end' })).toContain('tiger-sidebar-end')
  })

  it('does not fall back to a default landmark name for an empty aria-label', () => {
    expect(resolveSidebarAriaProps({ ariaLabel: '', fallback: 'Sidebar' })).toEqual({})
    expect(resolveSidebarAriaProps({ ariaLabelledby: 'nav-title', fallback: 'Sidebar' })).toEqual({
      'aria-labelledby': 'nav-title'
    })
    expect(resolveSidebarAriaProps({ fallback: 'Sidebar' })).toEqual({ 'aria-label': 'Sidebar' })
  })
})

describe('layout grid style injection', () => {
  afterEach(() => {
    document.getElementById(LAYOUT_GRID_STYLE_ID)?.remove()
    resetGridBreakpointSync()
  })

  it('injects geometry once and keeps reduced-motion duration at zero', () => {
    injectLayoutGridStyles()
    injectLayoutGridStyles()
    expect(document.querySelectorAll(`#${LAYOUT_GRID_STYLE_ID}`)).toHaveLength(1)
    const css = document.getElementById(LAYOUT_GRID_STYLE_ID)?.textContent ?? ''
    expect(css).toContain('prefers-reduced-motion: reduce')
    expect(css).toContain('column-gap: var(--tiger-row-gutter-x, 0px)')
    expect(css).toContain('border-inline-end')
    expect(css).toContain('--tiger-breakpoint-2xl')
  })
})
