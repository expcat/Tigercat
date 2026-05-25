/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createScrollSpyObserver,
  createScrollSpyPayload,
  flattenScrollSpyItems,
  getEnabledScrollSpyItems,
  getInitialScrollSpyActiveKey,
  getScrollSpyItemByHref,
  getScrollSpyItemByKey,
  getScrollSpyItemClasses,
  getScrollSpyKeyString,
  getScrollSpyListClasses,
  getScrollSpyRootClasses,
  getScrollSpyTargetHrefs,
  scrollToScrollSpyItem,
  type ScrollSpyItem
} from '@expcat/tigercat-core'

const items: ScrollSpyItem[] = [
  { key: 'intro', href: '#intro', label: 'Intro' },
  {
    key: 'usage',
    href: '#usage',
    label: 'Usage',
    children: [{ key: 'api', href: '#api', label: 'API' }]
  },
  { key: 'disabled', href: '#disabled', label: 'Disabled', disabled: true }
]

describe('scroll-spy-utils', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.height = '200px'
    container.style.overflow = 'auto'
    container.innerHTML = `
      <div style="height: 1000px">
        <section id="intro" style="height: 200px">Intro</section>
        <section id="usage" style="height: 200px">Usage</section>
        <section id="api" style="height: 200px">API</section>
        <section id="disabled" style="height: 200px">Disabled</section>
      </div>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.unstubAllGlobals()
  })

  describe('item helpers', () => {
    it('flattens nested items in display order', () => {
      expect(flattenScrollSpyItems(items).map((item) => item.key)).toEqual([
        'intro',
        'usage',
        'api',
        'disabled'
      ])
    })

    it('records nested item depth', () => {
      const flat = flattenScrollSpyItems(items)
      expect(flat.find((item) => item.key === 'intro')?.depth).toBe(0)
      expect(flat.find((item) => item.key === 'api')?.depth).toBe(1)
    })

    it('returns an empty array for missing items', () => {
      expect(flattenScrollSpyItems()).toEqual([])
    })

    it('filters enabled items with hrefs', () => {
      expect(getEnabledScrollSpyItems(items).map((item) => item.key)).toEqual([
        'intro',
        'usage',
        'api'
      ])
    })

    it('returns enabled href targets', () => {
      expect(getScrollSpyTargetHrefs(items)).toEqual(['#intro', '#usage', '#api'])
    })

    it('finds items by key', () => {
      expect(getScrollSpyItemByKey(items, 'usage')?.href).toBe('#usage')
      expect(getScrollSpyItemByKey(items, 'missing')).toBeUndefined()
    })

    it('finds items by href', () => {
      expect(getScrollSpyItemByHref(items, '#api')?.key).toBe('api')
      expect(getScrollSpyItemByHref(items, '#missing')).toBeUndefined()
    })

    it('normalizes string and numeric keys for DOM attributes', () => {
      expect(getScrollSpyKeyString('intro')).toBe('intro')
      expect(getScrollSpyKeyString(12)).toBe('12')
    })
  })

  describe('active key helpers', () => {
    it('prefers controlled activeKey', () => {
      expect(getInitialScrollSpyActiveKey(items, 'usage', 'intro')).toBe('usage')
    })

    it('uses defaultActiveKey when uncontrolled', () => {
      expect(getInitialScrollSpyActiveKey(items, undefined, 'api')).toBe('api')
    })

    it('falls back to the first enabled item', () => {
      expect(getInitialScrollSpyActiveKey(items)).toBe('intro')
    })

    it('returns undefined when no enabled item exists', () => {
      expect(
        getInitialScrollSpyActiveKey([{ key: 'x', href: '#x', label: 'X', disabled: true }])
      ).toBeUndefined()
    })
  })

  describe('class helpers', () => {
    it('returns vertical list classes', () => {
      expect(getScrollSpyListClasses('vertical')).toContain('flex-col')
    })

    it('returns horizontal list classes', () => {
      expect(getScrollSpyListClasses('horizontal')).toContain('flex-wrap')
    })

    it('adds sticky root class when enabled', () => {
      expect(getScrollSpyRootClasses(true, 'custom')).toContain('sticky')
      expect(getScrollSpyRootClasses(true, 'custom')).toContain('custom')
    })

    it('omits sticky root class when disabled', () => {
      expect(getScrollSpyRootClasses(false)).not.toContain('sticky')
    })

    it('adds active item classes', () => {
      expect(getScrollSpyItemClasses(true)).toContain('font-medium')
    })

    it('adds disabled item classes', () => {
      expect(getScrollSpyItemClasses(false, true)).toContain('cursor-not-allowed')
    })

    it('keeps custom item classes', () => {
      expect(getScrollSpyItemClasses(false, false, 'custom-link')).toContain('custom-link')
    })
  })

  describe('events and scrolling', () => {
    it('creates change payloads', () => {
      expect(createScrollSpyPayload(items[0], 'click')).toEqual({
        activeKey: 'intro',
        href: '#intro',
        item: items[0],
        source: 'click'
      })
    })

    it('scrolls enabled items into view', () => {
      const scrollToSpy = vi.spyOn(container, 'scrollTo')
      scrollToScrollSpyItem(items[0], container, 12)
      expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    })

    it('does not scroll disabled items', () => {
      const scrollToSpy = vi.spyOn(container, 'scrollTo')
      scrollToScrollSpyItem(items[2], container, 12)
      expect(scrollToSpy).not.toHaveBeenCalled()
    })

    it('returns a no-op observer for empty items', () => {
      const stop = createScrollSpyObserver([], { container, onChange: vi.fn() })
      expect(() => stop()).not.toThrow()
    })

    it('notifies the active item with the scroll fallback', () => {
      vi.stubGlobal('IntersectionObserver', undefined)
      const onChange = vi.fn()
      const stop = createScrollSpyObserver([items[0]], { container, onChange })
      container.dispatchEvent(new Event('scroll'))
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ key: 'intro' }))
      stop()
    })

    it('cleans up fallback scroll listeners', () => {
      vi.stubGlobal('IntersectionObserver', undefined)
      const removeSpy = vi.spyOn(container, 'removeEventListener')
      const stop = createScrollSpyObserver(items, { container, onChange: vi.fn() })
      stop()
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })
})
