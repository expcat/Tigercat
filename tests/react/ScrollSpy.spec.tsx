/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { ScrollSpyItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolations } from '../utils/react'
import { MockIntersectionObserver } from '../utils/mock-observers'

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

describe('ScrollSpy', () => {
  let scrollContainer: HTMLDivElement

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', undefined)
    scrollContainer = document.createElement('div')
    scrollContainer.style.height = '200px'
    scrollContainer.style.overflow = 'auto'
    scrollContainer.innerHTML = `
      <div style="height: 1000px">
        <section id="intro">Intro content</section>
        <section id="usage">Usage content</section>
        <section id="api">API content</section>
        <section id="disabled">Disabled content</section>
      </div>
    `
    document.body.appendChild(scrollContainer)
  })

  afterEach(() => {
    document.body.removeChild(scrollContainer)
    vi.unstubAllGlobals()
  })

  const renderScrollSpy = (props: Partial<React.ComponentProps<typeof ScrollSpy>> = {}) =>
    render(<ScrollSpy items={items} getContainer={() => scrollContainer} {...props} />)

  describe('Rendering', () => {
    it('renders all item labels', () => {
      renderScrollSpy()
      expect(screen.getByText('Intro')).toBeInTheDocument()
      expect(screen.getByText('Usage')).toBeInTheDocument()
      expect(screen.getByText('API')).toBeInTheDocument()
    })

    it('renders as a labelled nav landmark', () => {
      renderScrollSpy({ ariaLabel: 'Page sections' })
      expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
    })

    it('renders vertical layout by default', () => {
      const { container } = renderScrollSpy()
      expect(container.querySelector('ul')).toHaveClass('flex-col')
    })

    it('renders horizontal layout', () => {
      const { container } = renderScrollSpy({ direction: 'horizontal' })
      expect(container.querySelector('ul')).toHaveClass('flex-wrap')
    })

    it('applies custom className and style', () => {
      const { container } = renderScrollSpy({ className: 'custom-spy', style: { marginTop: 8 } })
      expect(container.firstChild).toHaveClass('custom-spy')
      expect(container.firstChild).toHaveStyle({ marginTop: '8px' })
    })

    it('applies sticky classes', () => {
      const { container } = renderScrollSpy({ sticky: true })
      expect(container.firstChild).toHaveClass('sticky')
    })

    it('renders nested items with depth data', () => {
      renderScrollSpy()
      expect(screen.getByText('API').closest('li')).toHaveAttribute('data-depth', '1')
    })

    it('marks disabled items with aria-disabled', () => {
      renderScrollSpy()
      expect(screen.getByText('Disabled')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Active State', () => {
    it('uses the first enabled item by default', () => {
      renderScrollSpy()
      expect(screen.getByText('Intro')).toHaveAttribute('aria-current', 'location')
    })

    it('uses defaultActiveKey in uncontrolled mode', () => {
      renderScrollSpy({ defaultActiveKey: 'usage' })
      expect(screen.getByText('Usage')).toHaveAttribute('aria-current', 'location')
    })

    it('uses controlled activeKey', () => {
      renderScrollSpy({ activeKey: 'api' })
      expect(screen.getByText('API')).toHaveAttribute('aria-current', 'location')
    })

    it('does not change the rendered active item in controlled mode after click', () => {
      renderScrollSpy({ activeKey: 'intro', onActiveKeyChange: vi.fn() })
      fireEvent.click(screen.getByText('Usage'))
      expect(screen.getByText('Intro')).toHaveAttribute('aria-current', 'location')
    })
  })

  describe('Events', () => {
    it('calls onClick when an enabled item is clicked', () => {
      const onClick = vi.fn()
      renderScrollSpy({ onClick })
      fireEvent.click(screen.getByText('Usage'))
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'usage' }),
        expect.any(Object)
      )
    })

    it('calls onActiveKeyChange with payload when active item changes by click', () => {
      const onActiveKeyChange = vi.fn()
      renderScrollSpy({ onActiveKeyChange })
      fireEvent.click(screen.getByText('Usage'))
      expect(onActiveKeyChange).toHaveBeenCalledWith(
        'usage',
        expect.objectContaining({ href: '#usage' }),
        expect.objectContaining({ source: 'click' })
      )
    })

    it('prevents default anchor navigation', () => {
      renderScrollSpy()
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      act(() => {
        screen.getByText('Usage').dispatchEvent(event)
      })
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('scrolls to the clicked target', () => {
      const scrollToSpy = vi.spyOn(scrollContainer, 'scrollTo')
      renderScrollSpy({ targetOffset: 24 })
      fireEvent.click(screen.getByText('Usage'))
      expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    })

    it('does not emit events for disabled items', () => {
      const onActiveKeyChange = vi.fn()
      const onClick = vi.fn()
      renderScrollSpy({ onActiveKeyChange, onClick })
      fireEvent.click(screen.getByText('Disabled'))
      expect(onActiveKeyChange).not.toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not emit change when clicking the active item', () => {
      const onActiveKeyChange = vi.fn()
      renderScrollSpy({ onActiveKeyChange })
      fireEvent.click(screen.getByText('Intro'))
      expect(onActiveKeyChange).not.toHaveBeenCalled()
    })

    it('keeps aria-current on the clicked last item while a scroll update would pick the first', () => {
      const intro = document.getElementById('intro') as HTMLElement
      const usage = document.getElementById('usage') as HTMLElement
      const api = document.getElementById('api') as HTMLElement
      Object.defineProperty(intro, 'offsetTop', { value: 10, configurable: true })
      Object.defineProperty(usage, 'offsetTop', { value: 500, configurable: true })
      Object.defineProperty(api, 'offsetTop', { value: 900, configurable: true })
      Object.defineProperty(intro, 'offsetParent', { value: scrollContainer, configurable: true })
      Object.defineProperty(usage, 'offsetParent', { value: scrollContainer, configurable: true })
      Object.defineProperty(api, 'offsetParent', { value: scrollContainer, configurable: true })
      scrollContainer.scrollTop = 0

      const onActiveKeyChange = vi.fn()
      renderScrollSpy({ onActiveKeyChange })

      fireEvent.click(screen.getByText('API'))
      expect(screen.getByText('API')).toHaveAttribute('aria-current', 'location')
      const changeCalls = onActiveKeyChange.mock.calls.length

      act(() => {
        scrollContainer.dispatchEvent(new Event('scroll'))
      })

      expect(screen.getByText('API')).toHaveAttribute('aria-current', 'location')
      expect(screen.getByText('Intro')).not.toHaveAttribute('aria-current')
      expect(onActiveKeyChange.mock.calls.length).toBe(changeCalls)
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderScrollSpy()
      await expectNoA11yViolations(container)
    })

    it('names the landmark from locale and skips disabled items in the tab order', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <ScrollSpy items={items} getContainer={() => scrollContainer} />
        </ConfigProvider>
      )
      expect(screen.getByRole('navigation', { name: '章节导航' })).toBeInTheDocument()
      expect(screen.getByText('Disabled')).toHaveAttribute('tabindex', '-1')
    })

    it('uses aria-current only on the active item', () => {
      renderScrollSpy({ defaultActiveKey: 'usage' })
      expect(screen.getByText('Usage')).toHaveAttribute('aria-current', 'location')
      expect(screen.getByText('Intro')).not.toHaveAttribute('aria-current')
    })
  })

  describe('Edge Cases', () => {
    it('renders an empty list when items are empty', () => {
      const { container } = render(<ScrollSpy items={[]} getContainer={() => scrollContainer} />)
      expect(container.querySelectorAll('a')).toHaveLength(0)
    })

    it('supports numeric keys', () => {
      render(
        <ScrollSpy
          items={[{ key: 1, href: '#intro', label: 'One' }]}
          activeKey={1}
          getContainer={() => scrollContainer}
        />
      )
      expect(screen.getByText('One')).toHaveAttribute('data-key', '1')
      expect(screen.getByText('One')).toHaveAttribute('aria-current', 'location')
    })

    it('handles missing target elements without throwing', () => {
      render(
        <ScrollSpy
          items={[
            { key: 'intro', href: '#intro', label: 'Intro' },
            { key: 'missing', href: '#missing', label: 'Missing' }
          ]}
        />
      )
      expect(() => fireEvent.click(screen.getByText('Missing'))).not.toThrow()
      expect(screen.getByText('Missing')).not.toHaveAttribute('aria-current')
      expect(screen.getByText('Intro')).toHaveAttribute('aria-current', 'location')
    })

    it('does not prevent modifier clicks', () => {
      renderScrollSpy()
      const link = screen.getByText('Usage')
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      act(() => {
        link.dispatchEvent(event)
      })
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('uses the same offset for sticky top', () => {
      const { container } = renderScrollSpy({ sticky: true, offsetTop: 48 })
      expect((container.firstChild as HTMLElement).style.top).toBe('48px')
    })
  })

  describe('scroll following', () => {
    it('keeps defaultActiveKey until the user scrolls, then follows the viewport', () => {
      MockIntersectionObserver.reset()
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
      const usage = document.getElementById('usage') as HTMLElement
      const intro = document.getElementById('intro') as HTMLElement
      const api = document.getElementById('api') as HTMLElement
      vi.spyOn(intro, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -200, 100, 40))
      vi.spyOn(usage, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 4, 100, 40))
      vi.spyOn(api, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 400, 100, 40))

      renderScrollSpy({ defaultActiveKey: 'intro' })
      expect(screen.getByText('Intro')).toHaveAttribute('aria-current', 'location')

      const observer = MockIntersectionObserver.instances.at(-1)
      observer?.trigger([{ target: usage, isIntersecting: true }])
      expect(screen.getByText('Intro')).toHaveAttribute('aria-current', 'location')

      act(() => {
        scrollContainer.dispatchEvent(new Event('scroll'))
      })
      expect(screen.getByText('Usage')).toHaveAttribute('aria-current', 'location')
    })
  })
})
