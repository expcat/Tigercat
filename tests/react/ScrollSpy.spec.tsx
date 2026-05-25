/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ScrollSpy, type ScrollSpyItem } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
      renderScrollSpy({ activeKey: 'intro', onChange: vi.fn() })
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

    it('calls onChange with payload when active item changes by click', () => {
      const onChange = vi.fn()
      renderScrollSpy({ onChange })
      fireEvent.click(screen.getByText('Usage'))
      expect(onChange).toHaveBeenCalledWith(
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
      const onChange = vi.fn()
      const onClick = vi.fn()
      renderScrollSpy({ onChange, onClick })
      fireEvent.click(screen.getByText('Disabled'))
      expect(onChange).not.toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not emit change when clicking the active item', () => {
      const onChange = vi.fn()
      renderScrollSpy({ onChange })
      fireEvent.click(screen.getByText('Intro'))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderScrollSpy({ ariaLabel: 'Article navigation' })
      await expectNoA11yViolationsIsolated(container)
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
      render(<ScrollSpy items={[{ key: 'missing', href: '#missing', label: 'Missing' }]} />)
      expect(() => fireEvent.click(screen.getByText('Missing'))).not.toThrow()
    })
  })
})
