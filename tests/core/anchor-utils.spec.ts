/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAnchorTargetElement,
  getContainerScrollTop,
  getContainerHeight,
  getElementOffsetTop,
  scrollToAnchor,
  findActiveAnchor,
  findActiveAnchorAtOffsetLine,
  createAnchorObserver,
  createProgrammaticScrollLock,
  getAnchorWrapperClasses,
  getAnchorInkContainerClasses,
  getAnchorInkActiveClasses,
  getAnchorLinkListClasses,
  getAnchorLinkClasses
} from '@expcat/tigercat-core'
import { MockIntersectionObserver } from '../utils/mock-observers'

describe('anchor-utils', () => {
  let container: HTMLDivElement
  let section1: HTMLDivElement
  let section2: HTMLDivElement
  let section3: HTMLDivElement

  beforeEach(() => {
    // Create a scrollable container
    container = document.createElement('div')
    container.style.height = '200px'
    container.style.overflow = 'auto'
    container.style.position = 'relative'

    // Create content with sections
    const content = document.createElement('div')
    content.style.height = '2000px'
    content.style.position = 'relative'

    section1 = document.createElement('div')
    section1.id = 'section1'
    section1.style.position = 'absolute'
    section1.style.top = '100px'
    section1.style.height = '100px'

    section2 = document.createElement('div')
    section2.id = 'section2'
    section2.style.position = 'absolute'
    section2.style.top = '500px'
    section2.style.height = '100px'

    section3 = document.createElement('div')
    section3.id = 'section3'
    section3.style.position = 'absolute'
    section3.style.top = '900px'
    section3.style.height = '100px'

    content.appendChild(section1)
    content.appendChild(section2)
    content.appendChild(section3)
    container.appendChild(content)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('getAnchorTargetElement', () => {
    it('should return element by href with #', () => {
      const element = getAnchorTargetElement('#section1')
      expect(element).toBe(section1)
    })

    it('should return null for invalid href', () => {
      expect(getAnchorTargetElement('')).toBeNull()
      expect(getAnchorTargetElement('section1')).toBeNull()
      expect(getAnchorTargetElement('#')).toBeNull()
    })

    it('should return null for non-existent element', () => {
      expect(getAnchorTargetElement('#nonexistent')).toBeNull()
    })
  })

  describe('getContainerScrollTop', () => {
    it('should return scroll top for element container', () => {
      container.scrollTop = 150
      expect(getContainerScrollTop(container)).toBe(150)
    })

    it('should return scroll top for window', () => {
      // Note: In happy-dom, window.scrollY may not work exactly as in a real browser
      expect(typeof getContainerScrollTop(window)).toBe('number')
    })
  })

  describe('getContainerHeight', () => {
    it('should return height for element container', () => {
      // Note: happy-dom may not properly simulate clientHeight, so we just verify it returns a number
      const height = getContainerHeight(container)
      expect(typeof height).toBe('number')
    })

    it('should return height for window', () => {
      expect(typeof getContainerHeight(window)).toBe('number')
    })
  })

  describe('getElementOffsetTop', () => {
    it('should return offset top relative to container', () => {
      // In happy-dom, getBoundingClientRect may return 0s, so we check the function doesn't throw
      const offset = getElementOffsetTop(section1, container)
      expect(typeof offset).toBe('number')
    })
  })

  describe('findActiveAnchorAtOffsetLine', () => {
    const links = ['#a', '#b', '#c']
    const tops: Record<string, number> = {
      '#a': 10,
      '#b': 50,
      '#c': 120
    }
    const getTop = (href: string): number | null => tops[href] ?? null

    it('picks the last section at or above the offset line, not the first', () => {
      expect(findActiveAnchorAtOffsetLine(links, getTop, 50)).toBe('#b')
      expect(findActiveAnchorAtOffsetLine(links, getTop, 49)).toBe('#a')
      expect(findActiveAnchorAtOffsetLine(links, getTop, 120)).toBe('#c')
      expect(findActiveAnchorAtOffsetLine(links, getTop, 9)).toBe('#a')
    })

    it('moves the offset line with bounds at the same scrollTop', () => {
      // offset line = scrollTop + bounds; tops 10 / 50 / 120
      // scrollTop 48, bounds 0 → line 48 → #a stays active
      // scrollTop 48, bounds 5 → line 53 → #b
      expect(findActiveAnchorAtOffsetLine(links, getTop, 48)).toBe('#a')
      expect(findActiveAnchorAtOffsetLine(links, getTop, 48 + 5)).toBe('#b')
    })

    it('returns the first link when no section is at or above the line', () => {
      expect(findActiveAnchorAtOffsetLine(links, getTop, 0)).toBe('#a')
    })

    it('returns empty string for empty links', () => {
      expect(findActiveAnchorAtOffsetLine([], getTop, 50)).toBe('')
    })
  })

  describe('findActiveAnchor', () => {
    it('should return empty string for empty links array', () => {
      const result = findActiveAnchor([], container, 5, 0)
      expect(result).toBe('')
    })

    it('should return a valid link from the provided links', () => {
      const links = ['#section1', '#section2', '#section3']
      const result = findActiveAnchor(links, container, 5, 0)
      // Result should be one of the provided links
      expect(links).toContain(result)
    })

    it('should return first link even if element does not exist', () => {
      const links = ['#nonexistent']
      const result = findActiveAnchor(links, container, 5, 0)
      expect(result).toBe('#nonexistent')
    })

    it('should accept bounds parameter without throwing', () => {
      const links = ['#section1', '#section2']
      expect(() => findActiveAnchor(links, container, 10, 0)).not.toThrow()
      expect(() => findActiveAnchor(links, container, 0, 0)).not.toThrow()
    })

    it('should accept targetOffset parameter without throwing', () => {
      const links = ['#section1', '#section2']
      expect(() => findActiveAnchor(links, container, 5, 50)).not.toThrow()
      expect(() => findActiveAnchor(links, container, 5, 100)).not.toThrow()
    })

    it('should work with different scroll positions', () => {
      const links = ['#section1', '#section2', '#section3']

      // Test at different scroll positions
      container.scrollTop = 0
      const result1 = findActiveAnchor(links, container, 5, 0)
      expect(links).toContain(result1)

      container.scrollTop = 200
      const result2 = findActiveAnchor(links, container, 5, 0)
      expect(links).toContain(result2)

      container.scrollTop = 600
      const result3 = findActiveAnchor(links, container, 5, 0)
      expect(links).toContain(result3)
    })

    it('picks the last section at or above the offset line with stubbed offsets', () => {
      const links = ['#section1', '#section2', '#section3']
      Object.defineProperty(section1, 'offsetTop', { value: 10, configurable: true })
      Object.defineProperty(section2, 'offsetTop', { value: 50, configurable: true })
      Object.defineProperty(section3, 'offsetTop', { value: 120, configurable: true })
      Object.defineProperty(section1, 'offsetParent', { value: container, configurable: true })
      Object.defineProperty(section2, 'offsetParent', { value: container, configurable: true })
      Object.defineProperty(section3, 'offsetParent', { value: container, configurable: true })

      container.scrollTop = 50
      expect(findActiveAnchor(links, container, 0, 0)).toBe('#section2')

      container.scrollTop = 49
      expect(findActiveAnchor(links, container, 0, 0)).toBe('#section1')
    })

    it('keeps the previous section active at the same scrollTop with a smaller bounds', () => {
      const links = ['#section1', '#section2', '#section3']
      Object.defineProperty(section1, 'offsetTop', { value: 10, configurable: true })
      Object.defineProperty(section2, 'offsetTop', { value: 50, configurable: true })
      Object.defineProperty(section3, 'offsetTop', { value: 120, configurable: true })
      Object.defineProperty(section1, 'offsetParent', { value: container, configurable: true })
      Object.defineProperty(section2, 'offsetParent', { value: container, configurable: true })
      Object.defineProperty(section3, 'offsetParent', { value: container, configurable: true })

      container.scrollTop = 48
      expect(findActiveAnchor(links, container, 0, 0)).toBe('#section1')
      expect(findActiveAnchor(links, container, 5, 0)).toBe('#section2')
    })
  })

  describe('createAnchorObserver', () => {
    beforeEach(() => {
      MockIntersectionObserver.reset()
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('reports the last-at-offset-line href when first and last both intersect', () => {
      const spy1 = vi.spyOn(section1, 'getBoundingClientRect')
      vi.spyOn(section2, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 1100, 100, 40))
      const spy3 = vi.spyOn(section3, 'getBoundingClientRect')
      spy1.mockReturnValue(new DOMRect(0, 1000, 100, 40))
      spy3.mockReturnValue(new DOMRect(0, 1200, 100, 40))

      const onChange = vi.fn()
      const stop = createAnchorObserver(['#section1', '#section2', '#section3'], {
        offsetTop: 0,
        bounds: 5,
        onChange
      })

      expect(onChange).toHaveBeenCalledWith('#section1')

      spy1.mockReturnValue(new DOMRect(0, 0, 100, 40))
      spy3.mockReturnValue(new DOMRect(0, 4, 100, 40))

      const observer = MockIntersectionObserver.instances.at(-1)
      expect(observer).toBeDefined()
      observer?.trigger([
        { target: section1, isIntersecting: true },
        { target: section3, isIntersecting: true }
      ])

      expect(onChange).toHaveBeenLastCalledWith('#section3')
      stop()
    })
  })

  describe('createProgrammaticScrollLock', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
      Reflect.deleteProperty(window, 'onscrollend')
    })

    it('ignores updates while locked and accepts them after idle', () => {
      const target = document.createElement('div')
      const lock = createProgrammaticScrollLock(() => target)
      const accepted: string[] = []
      const apply = (href: string) => {
        if (lock.isLocked()) return
        accepted.push(href)
      }

      lock.lock()
      apply('#first')
      expect(accepted).toEqual([])
      expect(lock.isLocked()).toBe(true)

      vi.advanceTimersByTime(149)
      expect(lock.isLocked()).toBe(true)
      apply('#first')
      expect(accepted).toEqual([])

      vi.advanceTimersByTime(1)
      expect(lock.isLocked()).toBe(false)
      apply('#first')
      expect(accepted).toEqual(['#first'])
    })

    it('unlocks on scrollend when the event exists', () => {
      Object.defineProperty(window, 'onscrollend', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: null
      })
      const target = document.createElement('div')
      const lock = createProgrammaticScrollLock(() => target)
      lock.lock()
      expect(lock.isLocked()).toBe(true)
      target.dispatchEvent(new Event('scrollend'))
      expect(lock.isLocked()).toBe(false)
    })

    it('resets idle on rapid lock so the last click wins', () => {
      const target = document.createElement('div')
      const lock = createProgrammaticScrollLock(() => target)
      lock.lock()
      vi.advanceTimersByTime(100)
      lock.lock()
      vi.advanceTimersByTime(100)
      expect(lock.isLocked()).toBe(true)
      vi.advanceTimersByTime(50)
      expect(lock.isLocked()).toBe(false)
    })

    it('unlocks after the safety timeout while scroll events keep resetting idle', () => {
      const target = document.createElement('div')
      const lock = createProgrammaticScrollLock(() => target)
      lock.lock()
      const interval = setInterval(() => {
        target.dispatchEvent(new Event('scroll'))
      }, 40)
      vi.advanceTimersByTime(1999)
      expect(lock.isLocked()).toBe(true)
      vi.advanceTimersByTime(1)
      expect(lock.isLocked()).toBe(false)
      clearInterval(interval)
    })
  })

  describe('scrollToAnchor', () => {
    it('should not throw for valid href', () => {
      expect(() => scrollToAnchor('#section1', container, 0)).not.toThrow()
    })

    it('should not throw for invalid href', () => {
      expect(() => scrollToAnchor('#nonexistent', container, 0)).not.toThrow()
    })

    it('should not throw with targetOffset', () => {
      expect(() => scrollToAnchor('#section1', container, 50)).not.toThrow()
    })

    it('should call scrollTo on container for valid element', () => {
      const scrollToSpy = vi.spyOn(container, 'scrollTo')
      scrollToAnchor('#section1', container, 0)
      expect(scrollToSpy).toHaveBeenCalled()
    })

    it('should not call scrollTo for non-existent element', () => {
      const scrollToSpy = vi.spyOn(container, 'scrollTo')
      scrollToAnchor('#nonexistent', container, 0)
      expect(scrollToSpy).not.toHaveBeenCalled()
    })

    it('should pass smooth behavior to scrollTo', () => {
      const scrollToSpy = vi.spyOn(container, 'scrollTo')
      scrollToAnchor('#section1', container, 0)
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth'
        })
      )
    })
  })

  describe('CSS class generators', () => {
    describe('getAnchorWrapperClasses', () => {
      it('should include fixed class when affix is true', () => {
        const classes = getAnchorWrapperClasses(true)
        expect(classes).toContain('fixed')
      })

      it('should not include fixed class when affix is false', () => {
        const classes = getAnchorWrapperClasses(false)
        expect(classes).not.toContain('fixed')
      })

      it('should include custom className', () => {
        const classes = getAnchorWrapperClasses(true, 'custom-class')
        expect(classes).toContain('custom-class')
      })

      it('should always include relative class', () => {
        const classesWithAffix = getAnchorWrapperClasses(true)
        const classesWithoutAffix = getAnchorWrapperClasses(false)
        expect(classesWithAffix).toContain('relative')
        expect(classesWithoutAffix).toContain('relative')
      })
    })

    describe('getAnchorInkContainerClasses', () => {
      it('should return vertical classes for vertical direction', () => {
        const classes = getAnchorInkContainerClasses('vertical')
        expect(classes).toContain('left-0')
        expect(classes).toContain('w-0.5')
      })

      it('should return horizontal classes for horizontal direction', () => {
        const classes = getAnchorInkContainerClasses('horizontal')
        expect(classes).toContain('bottom-0')
        expect(classes).toContain('h-0.5')
      })
    })

    describe('getAnchorInkActiveClasses', () => {
      it('should return vertical classes for vertical direction', () => {
        const classes = getAnchorInkActiveClasses('vertical')
        expect(classes).toContain('w-0.5')
        expect(classes).toContain('transition')
      })

      it('should return horizontal classes for horizontal direction', () => {
        const classes = getAnchorInkActiveClasses('horizontal')
        expect(classes).toContain('h-0.5')
        expect(classes).toContain('transition')
      })
    })

    describe('getAnchorLinkListClasses', () => {
      it('should return vertical classes for vertical direction', () => {
        const classes = getAnchorLinkListClasses('vertical')
        expect(classes).toContain('pl-4')
        expect(classes).toContain('space-y-2')
      })

      it('should return horizontal classes for horizontal direction', () => {
        const classes = getAnchorLinkListClasses('horizontal')
        expect(classes).toContain('flex')
        expect(classes).toContain('space-x-4')
      })
    })

    describe('getAnchorLinkClasses', () => {
      it('should include active classes when active', () => {
        const classes = getAnchorLinkClasses(true)
        expect(classes).toContain('font-medium')
      })

      it('should not include active classes when not active', () => {
        const classes = getAnchorLinkClasses(false)
        expect(classes).not.toContain('font-medium')
      })

      it('should include custom className', () => {
        const classes = getAnchorLinkClasses(false, 'custom-link')
        expect(classes).toContain('custom-link')
      })

      it('should include base link styles', () => {
        const classes = getAnchorLinkClasses(false)
        expect(classes).toContain('text-sm')
        expect(classes).toContain('transition')
      })
    })
  })
})
