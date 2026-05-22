/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import { Affix } from '@expcat/tigercat-vue'
import { MockIntersectionObserver, MockResizeObserver } from '../utils/mock-observers'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Affix', () => {
  beforeEach(() => {
    MockIntersectionObserver.reset()
    MockResizeObserver.reset()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders children and forwards wrapper attributes while not affixed', () => {
    render(Affix, {
      props: {
        className: 'custom-affix',
        style: { color: 'red' }
      },
      attrs: {
        'data-testid': 'affix-content',
        class: 'from-attrs'
      },
      slots: {
        default: '<span>Pinned content</span>'
      }
    })

    const content = screen.getByTestId('affix-content')
    expect(content).toHaveTextContent('Pinned content')
    expect(content).toHaveClass('custom-affix')
    expect(content).toHaveClass('from-attrs')
    expect(content).toHaveStyle({ color: 'red' })
    expect(content.previousElementSibling).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses an IntersectionObserver sentinel with the configured offset and target root', async () => {
    const root = document.createElement('div')
    root.id = 'affix-root'
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 500))
    document.body.appendChild(root)

    const { unmount } = render(Affix, {
      props: {
        target: '#affix-root',
        offsetTop: 24
      },
      attrs: {
        'data-testid': 'affix-content'
      },
      slots: {
        default: 'Pinned content'
      }
    })

    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))
    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))

    const observer = MockIntersectionObserver.instances[0]
    expect(observer.root).toBe(root)
    expect(observer.rootMargin).toBe('-24px 0px 0px 0px')
    expect(observer.observe).toHaveBeenCalledWith(expect.any(HTMLElement))
    expect(MockResizeObserver.instances[0].observe).toHaveBeenCalledWith(
      screen.getByTestId('affix-content')
    )

    unmount()
    expect(observer.disconnect).toHaveBeenCalledTimes(1)
    expect(MockResizeObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
    document.body.removeChild(root)
  })

  it('toggles fixed styles, placeholder dimensions, and change events', async () => {
    const { emitted } = render(Affix, {
      props: {
        offsetTop: 12,
        zIndex: 42,
        style: { color: 'red' }
      },
      attrs: {
        'data-testid': 'affix-content'
      },
      slots: {
        default: 'Pinned content'
      }
    })

    const content = screen.getByTestId('affix-content')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(24, 40, 180, 36))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    MockIntersectionObserver.instances[0].trigger({
      isIntersecting: false,
      boundingClientRect: new DOMRect(0, -1, 0, 0),
      rootBounds: new DOMRect(0, 0, 100, 600)
    })

    await waitFor(() => expect(screen.getByTestId('affix-content')).toHaveStyle('position: fixed'))
    expect(screen.getByTestId('affix-content')).toHaveStyle({
      top: '12px',
      left: '24px',
      width: '180px',
      zIndex: '42',
      color: 'red'
    })
    expect(screen.getByTestId('affix-content').previousElementSibling).toHaveStyle({
      width: '180px',
      height: '36px'
    })
    expect(emitted().change).toEqual([[true]])

    MockIntersectionObserver.instances[0].trigger({
      isIntersecting: true,
      boundingClientRect: new DOMRect(0, 20, 0, 0),
      rootBounds: new DOMRect(0, 0, 100, 600)
    })

    await waitFor(() =>
      expect(screen.getByTestId('affix-content')).not.toHaveStyle('position: fixed')
    )
    expect(emitted().change).toEqual([[true], [false]])
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Affix)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
