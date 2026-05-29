/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import React from 'react'
import { Affix } from '@expcat/tigercat-react'
import { MockIntersectionObserver, MockResizeObserver } from '../utils/mock-observers'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    render(
      <Affix className="custom-affix" style={{ color: 'red' }} data-testid="affix-content">
        <span>Pinned content</span>
      </Affix>
    )

    const content = screen.getByTestId('affix-content')
    expect(content).toHaveTextContent('Pinned content')
    expect(content).toHaveClass('custom-affix')
    expect(content).toHaveStyle({ color: 'red' })
    expect(content.previousElementSibling).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses an IntersectionObserver sentinel with the configured offset and target root', async () => {
    const root = document.createElement('div')
    root.id = 'affix-root'
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 500))
    document.body.appendChild(root)

    const { unmount } = render(
      <Affix target="#affix-root" offsetTop={24} data-testid="affix-content">
        Pinned content
      </Affix>
    )

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
    const handleChange = vi.fn()
    render(
      <Affix
        offsetTop={12}
        zIndex={42}
        style={{ color: 'red' }}
        data-testid="affix-content"
        onChange={handleChange}>
        Pinned content
      </Affix>
    )

    const content = screen.getByTestId('affix-content')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(24, 40, 180, 36))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: false,
        boundingClientRect: new DOMRect(0, -1, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
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
    expect(handleChange).toHaveBeenCalledWith(true)

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: true,
        boundingClientRect: new DOMRect(0, 20, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() =>
      expect(screen.getByTestId('affix-content')).not.toHaveStyle('position: fixed')
    )
    expect(handleChange).toHaveBeenLastCalledWith(false)
    expect(handleChange).toHaveBeenCalledTimes(2)
  })
  it('applies offsetBottom with bottom-affixed rootMargin', async () => {
    render(
      <Affix offsetBottom={20} data-testid="affix-bottom">
        Bottom pinned
      </Affix>
    )

    const content = screen.getByTestId('affix-bottom')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 500, 200, 40))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    const observer = MockIntersectionObserver.instances[0]
    expect(observer.rootMargin).toBe('0px 0px -20px 0px')
  })

  it('uses default zIndex of 10 when not specified', async () => {
    render(
      <Affix offsetTop={0} data-testid="affix-z">
        Content
      </Affix>
    )

    const content = screen.getByTestId('affix-z')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 30))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: false,
        boundingClientRect: new DOMRect(0, -1, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() => expect(screen.getByTestId('affix-z').style.position).toBe('fixed'))
    expect(screen.getByTestId('affix-z')).toHaveStyle({ zIndex: '10' })
  })

  it('falls back to window when target selector matches nothing', async () => {
    render(
      <Affix target="#does-not-exist" offsetTop={0} data-testid="affix-fallback">
        Content
      </Affix>
    )

    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))
    expect(MockIntersectionObserver.instances[0].root).toBeNull()
  })

  it('renders placeholder sentinel with aria-hidden', () => {
    render(<Affix data-testid="affix-sentinel">Content</Affix>)

    const wrapper = screen.getByTestId('affix-sentinel')
    const sentinel = wrapper.previousElementSibling
    expect(sentinel).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders without any children', () => {
    const { container } = render(<Affix />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('does not fire onChange again when affixed state is unchanged', async () => {
    const handleChange = vi.fn()
    render(
      <Affix offsetTop={10} data-testid="affix-dedup" onChange={handleChange}>
        Content
      </Affix>
    )

    const content = screen.getByTestId('affix-dedup')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 30))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: false,
        boundingClientRect: new DOMRect(0, -1, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() => expect(screen.getByTestId('affix-dedup').style.position).toBe('fixed'))

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: false,
        boundingClientRect: new DOMRect(0, -5, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() => expect(handleChange).toHaveBeenCalledTimes(1))
  })

  it('applies bottom fixed position with offsetBottom', async () => {
    render(
      <Affix offsetBottom={16} zIndex={50} data-testid="affix-bot-style">
        Bottom
      </Affix>
    )

    const content = screen.getByTestId('affix-bot-style')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 550, 200, 40))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: false,
        boundingClientRect: new DOMRect(0, 610, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() => expect(screen.getByTestId('affix-bot-style').style.position).toBe('fixed'))
    expect(screen.getByTestId('affix-bot-style')).toHaveStyle({ bottom: '16px', zIndex: '50' })
  })

  it('uses default offsetTop of 0 when no offset is specified', async () => {
    render(<Affix data-testid="affix-default">Content</Affix>)

    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))
    expect(MockIntersectionObserver.instances[0].rootMargin).toBe('0px 0px 0px 0px')
  })

  it('resets placeholder dimensions when un-affixed', async () => {
    render(
      <Affix offsetTop={5} data-testid="affix-reset">
        Content
      </Affix>
    )

    const content = screen.getByTestId('affix-reset')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 10, 150, 25))
    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: false,
        boundingClientRect: new DOMRect(0, -1, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() => expect(screen.getByTestId('affix-reset').style.position).toBe('fixed'))
    const placeholder = screen.getByTestId('affix-reset').previousElementSibling as HTMLElement
    expect(placeholder).toHaveStyle({ width: '150px', height: '25px' })

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        isIntersecting: true,
        boundingClientRect: new DOMRect(0, 20, 0, 0),
        rootBounds: new DOMRect(0, 0, 100, 600)
      })
    })

    await waitFor(() => expect(screen.getByTestId('affix-reset').style.position).not.toBe('fixed'))
  })

  it('disconnects observers on unmount', async () => {
    const { unmount } = render(<Affix offsetTop={0}>Content</Affix>)

    await waitFor(() => expect(MockIntersectionObserver.instances).toHaveLength(1))
    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))

    unmount()

    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled()
    expect(MockResizeObserver.instances[0].disconnect).toHaveBeenCalled()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Affix />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
