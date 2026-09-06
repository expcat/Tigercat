/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  findNearestOverflowAncestor,
  querySelectorAllSafe,
  querySelectorSafe,
  resolveScrollRoot,
  resetDevWarnCache
} from '@expcat/tigercat-core'

describe('resolveScrollRoot', () => {
  afterEach(() => {
    resetDevWarnCache()
    vi.restoreAllMocks()
  })

  it('falls back to window when input is omitted or null', () => {
    expect(resolveScrollRoot().isWindow).toBe(true)
    expect(resolveScrollRoot().target).toBe(window)
    expect(resolveScrollRoot(null).isWindow).toBe(true)
  })

  it('returns the element for a matching selector', () => {
    const root = document.createElement('div')
    root.id = 'scroll-root'
    document.body.appendChild(root)

    const resolved = resolveScrollRoot('#scroll-root')
    expect(resolved.isWindow).toBe(false)
    expect(resolved.target).toBe(root)

    root.remove()
  })

  it('falls back to window when the selector matches nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolved = resolveScrollRoot('#does-not-exist')
    expect(resolved.isWindow).toBe(true)
    expect(resolved.target).toBe(window)
    expect(warn).toHaveBeenCalled()
  })

  it('does not throw on an illegal selector and falls back to window', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => resolveScrollRoot('[')).not.toThrow()
    expect(() => resolveScrollRoot('##')).not.toThrow()
    expect(resolveScrollRoot('[').isWindow).toBe(true)
    expect(resolveScrollRoot('##').isWindow).toBe(true)
    expect(warn).toHaveBeenCalled()
  })

  it('uses the first match and warns when a selector hits more than one node', () => {
    const first = document.createElement('div')
    first.className = 'dup-root'
    const second = document.createElement('div')
    second.className = 'dup-root'
    document.body.append(first, second)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolved = resolveScrollRoot('.dup-root')
    expect(resolved.target).toBe(first)
    expect(resolved.isWindow).toBe(false)
    expect(warn).toHaveBeenCalled()

    first.remove()
    second.remove()
  })

  it('accepts an Element or Window directly', () => {
    const el = document.createElement('section')
    expect(resolveScrollRoot(el).target).toBe(el)
    expect(resolveScrollRoot(el).isWindow).toBe(false)
    expect(resolveScrollRoot(window).isWindow).toBe(true)
    expect(resolveScrollRoot(document).isWindow).toBe(true)
  })

  it('unwraps a getter and follows the resolved node', () => {
    const el = document.createElement('div')
    el.id = 'from-getter'
    document.body.appendChild(el)

    const resolved = resolveScrollRoot(() => el)
    expect(resolved.target).toBe(el)

    const nested = resolveScrollRoot(() => () => '#from-getter')
    expect(nested.target).toBe(el)

    el.remove()
  })

  it('falls back to window when a getter throws', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolved = resolveScrollRoot(() => {
      throw new Error('boom')
    })
    expect(resolved.isWindow).toBe(true)
    expect(warn).toHaveBeenCalled()
  })

  it('querySelector helpers never throw on a bad selector', () => {
    expect(querySelectorSafe('[')).toBeNull()
    expect(querySelectorAllSafe('##')).toEqual([])
    expect(querySelectorSafe('#missing')).toBeNull()
  })

  it('walks to the nearest overflow ancestor when input is omitted', () => {
    const scroller = document.createElement('div')
    scroller.style.overflowY = 'auto'
    scroller.style.overflowX = 'hidden'
    const child = document.createElement('span')
    scroller.appendChild(child)
    document.body.appendChild(scroller)

    expect(findNearestOverflowAncestor(child)).toBe(scroller)
    const resolved = resolveScrollRoot(undefined, { from: child })
    expect(resolved.isWindow).toBe(false)
    expect(resolved.target).toBe(scroller)

    scroller.remove()
  })

  it('keeps an explicit null target on window even when from is set', () => {
    const scroller = document.createElement('div')
    scroller.style.overflow = 'scroll'
    const child = document.createElement('span')
    scroller.appendChild(child)
    document.body.appendChild(scroller)

    expect(resolveScrollRoot(null, { from: child }).isWindow).toBe(true)

    scroller.remove()
  })
})
