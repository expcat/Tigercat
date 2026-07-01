/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import userEvent from '@testing-library/user-event'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

const twoItems = () => [
  h(BreadcrumbItem, { href: '/' }, () => 'Home'),
  h(BreadcrumbItem, { current: true }, () => 'Current')
]
const renderBc = (props: Record<string, unknown> = {}, slots = twoItems) =>
  render(Breadcrumb, { props, slots: { default: slots } })
const sep = (container: HTMLElement) => container.querySelector('[aria-hidden="true"]')

describe('Breadcrumb', () => {
  describe('Rendering', () => {
    it('renders items inside a labelled nav and ordered list', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { href: '/products' }, () => 'Products'),
            h(BreadcrumbItem, { current: true }, () => 'Details')
          ]
        }
      })
      expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'Breadcrumb')
      expect(container.querySelectorAll('ol > li')).toHaveLength(3)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('renders extra content via the extra slot', () => {
      const { container } = render(Breadcrumb, {
        slots: { default: twoItems, extra: () => h('button', {}, 'Action') }
      })
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(container.querySelector('.ml-auto')).toBeInTheDocument()
    })
  })

  describe('Separator', () => {
    it.each([
      [undefined, '/'],
      ['arrow', '→'],
      ['chevron', '›'],
      ['>', '>']
    ])('renders the %s separator as "%s"', (separator, expected) => {
      const { container } = renderBc({ separator })
      expect(sep(container)).toHaveTextContent(expected)
    })

    it('does not render a separator after the last item', () => {
      const { container } = renderBc()
      const items = container.querySelectorAll('li')
      expect(items[items.length - 1]?.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('allows an item-level separator override', () => {
      const { container } = renderBc({ separator: '/' }, () => [
        h(BreadcrumbItem, { href: '/', separator: 'arrow' }, () => 'Home'),
        h(BreadcrumbItem, { current: true }, () => 'Current')
      ])
      expect(sep(container)).toHaveTextContent('→')
    })

    it('reacts to parent separator prop changes', async () => {
      const { container, rerender } = renderBc({ separator: '/' })
      expect(sep(container)).toHaveTextContent('/')
      await rerender({ separator: 'arrow' })
      expect(sep(container)).toHaveTextContent('→')
    })

    it('keeps the item-level override when the parent separator changes', async () => {
      const { container, rerender } = renderBc({ separator: '/' }, () => [
        h(BreadcrumbItem, { href: '/', separator: 'chevron' }, () => 'Home'),
        h(BreadcrumbItem, { current: true }, () => 'Current')
      ])
      expect(sep(container)).toHaveTextContent('›')
      await rerender({ separator: 'arrow' })
      expect(sep(container)).toHaveTextContent('›')
    })
  })

  describe('BreadcrumbItem', () => {
    it('renders a link with target/rel when href is set and not current', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: 'https://example.com', target: '_blank' }, () => 'External')
          ]
        }
      })
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders the current item as a span with aria-current="page"', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/current', current: true }, () => 'Current')]
        }
      })
      expect(container.querySelector('a')).toBeNull()
      expect(container.querySelector('[aria-current="page"]')).toHaveTextContent('Current')
    })

    it('renders an icon alongside the label', () => {
      render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/', icon: '🏠' }, () => 'Home')]
        }
      })
      expect(screen.getByText('🏠')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('emits click when a link item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/home', onClick: handleClick }, () => 'Home')]
        }
      })
      await user.click(screen.getByText('Home'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not emit click on the current item', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { current: true, onClick: handleClick }, () => 'Current')]
        }
      })
      await user.click(screen.getByText('Current'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom classes and styles', () => {
    it('merges the className prop with attrs class on the container', () => {
      const { container } = render(Breadcrumb, {
        props: { className: 'from-prop' },
        attrs: { class: 'from-attrs' },
        slots: { default: () => [h(BreadcrumbItem, {}, () => 'Home')] }
      })
      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('from-prop')
      expect(nav).toHaveClass('from-attrs')
    })

    it('merges the className prop with attrs class on an item', () => {
      const { container } = render(BreadcrumbItem, {
        props: { className: 'from-prop' },
        attrs: { class: 'from-attrs' },
        slots: { default: () => 'Home' }
      })
      const item = container.querySelector('li')
      expect(item).toHaveClass('from-prop')
      expect(item).toHaveClass('from-attrs')
    })

    it('applies custom style to the container and items', () => {
      const { container } = render(Breadcrumb, {
        props: { style: { fontSize: '20px' } },
        slots: { default: () => [h(BreadcrumbItem, { style: { color: 'red' } }, () => 'Home')] }
      })
      expect(container.querySelector('nav')).toHaveStyle({ fontSize: '20px' })
      expect(container.querySelector('li')).toHaveStyle({ color: 'red' })
    })
  })

  describe('maxItems collapse', () => {
    const items = () => [
      h(BreadcrumbItem, { href: '/' }, () => 'Home'),
      h(BreadcrumbItem, { href: '/a' }, () => 'A'),
      h(BreadcrumbItem, { href: '/b' }, () => 'B'),
      h(BreadcrumbItem, { href: '/c' }, () => 'C'),
      h(BreadcrumbItem, { current: true }, () => 'Current')
    ]
    const ellipsis = (container: HTMLElement) =>
      container.querySelector('button[aria-label="Show collapsed breadcrumb items"]')

    it('collapses middle items into an ellipsis when maxItems is set', () => {
      const { container } = render(Breadcrumb, { props: { maxItems: 3 }, slots: { default: items } })
      expect(ellipsis(container)).toBeInTheDocument()
      expect(container.querySelectorAll('li')).toHaveLength(4)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.queryByText('A')).not.toBeInTheDocument()
    })

    it('expands all items when the ellipsis is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(Breadcrumb, { props: { maxItems: 3 }, slots: { default: items } })
      await user.click(ellipsis(container)!)
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(ellipsis(container)).toBeNull()
    })

    it('does not collapse when maxItems is >= the item count', () => {
      const { container } = render(Breadcrumb, { props: { maxItems: 10 }, slots: { default: items } })
      expect(ellipsis(container)).toBeNull()
      expect(container.querySelectorAll('li')).toHaveLength(5)
    })
  })

  describe('Accessibility', () => {
    it('hides separators from screen readers', () => {
      const { container } = renderBc()
      expect(sep(container)).toBeInTheDocument()
    })

    it('has no accessibility violations', async () => {
      const { container } = render(Breadcrumb)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
