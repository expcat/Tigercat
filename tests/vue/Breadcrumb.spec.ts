/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import userEvent from '@testing-library/user-event'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Breadcrumb', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { href: '/products' }, () => 'Products'),
            h(BreadcrumbItem, { current: true }, () => 'Details')
          ]
        }
      })

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should render with proper ARIA attributes', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/' }, () => 'Home')]
        }
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('should render breadcrumb items in ordered list', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const ol = container.querySelector('ol')
      expect(ol).toBeInTheDocument()
      expect(ol?.querySelectorAll('li')).toHaveLength(2)
    })

    it('should render extra content via slot', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ],
          extra: () => h('button', {}, 'Action')
        }
      })

      expect(screen.getByText('Action')).toBeInTheDocument()
      const extraDiv = container.querySelector('.ml-auto')
      expect(extraDiv).toBeInTheDocument()
    })

    it('should render extra content via prop', () => {
      const { container } = render(Breadcrumb, {
        props: { extra: h('span', {}, 'Extra') },
        slots: {
          default: () => [h(BreadcrumbItem, { current: true }, () => 'Current')]
        }
      })

      expect(screen.getByText('Extra')).toBeInTheDocument()
      const extraDiv = container.querySelector('.ml-auto')
      expect(extraDiv).toBeInTheDocument()
    })
  })

  describe('Separator', () => {
    it('should render with default separator', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('/')
    })

    it('should render with arrow separator', () => {
      const { container } = render(Breadcrumb, {
        props: { separator: 'arrow' },
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('→')
    })

    it('should render with chevron separator', () => {
      const { container } = render(Breadcrumb, {
        props: { separator: 'chevron' },
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('›')
    })

    it('should render with custom separator', () => {
      const { container } = render(Breadcrumb, {
        props: { separator: '>' },
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('>')
    })

    it('should not render separator for current/last item', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const items = container.querySelectorAll('li')
      const lastItem = items[items.length - 1]
      expect(lastItem?.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('should allow item-level separator override', () => {
      const { container } = render(Breadcrumb, {
        props: { separator: '/' },
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/', separator: 'arrow' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('→')
    })
  })

  describe('BreadcrumbItem', () => {
    it('should render as link when href is provided and not current', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/home' }, () => 'Home')]
        }
      })

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/home')
    })

    it('should render as span when current is true', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/current', current: true }, () => 'Current')]
        }
      })

      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span).toHaveTextContent('Current')
      expect(container.querySelector('a')).toBeNull()
    })

    it('should have aria-current="page" for current item', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { current: true }, () => 'Current')]
        }
      })

      const span = container.querySelector('[aria-current="page"]')
      expect(span).toBeInTheDocument()
    })

    it('should support target attribute', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: 'https://example.com', target: '_blank' }, () => 'External')
          ]
        }
      })

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render icon when provided', () => {
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
    it('should emit click event when item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { href: '/home', onClick: handleClick }, () => 'Home')]
        }
      })

      const link = screen.getByText('Home')
      await user.click(link)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not emit click event when current item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { current: true, onClick: handleClick }, () => 'Current')
          ]
        }
      })

      const item = screen.getByText('Current')
      await user.click(item)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      expect(container.querySelector('nav')).toBeInTheDocument()
      expect(container.querySelector('ol')).toBeInTheDocument()
      expect(container.querySelectorAll('li')).toHaveLength(2)
    })

    it('should hide separators from screen readers', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [
            h(BreadcrumbItem, { href: '/' }, () => 'Home'),
            h(BreadcrumbItem, { current: true }, () => 'Current')
          ]
        }
      })

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom className to container', () => {
      const { container } = render(Breadcrumb, {
        props: { className: 'custom-breadcrumb' },
        slots: {
          default: () => [h(BreadcrumbItem, {}, () => 'Home')]
        }
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-breadcrumb')
    })

    it('should merge attrs.class with className on container', () => {
      const { container } = render(Breadcrumb, {
        props: { className: 'from-prop' },
        attrs: { class: 'from-attrs' },
        slots: {
          default: () => [h(BreadcrumbItem, {}, () => 'Home')]
        }
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('from-prop')
      expect(nav).toHaveClass('from-attrs')
    })

    it('should apply custom style to container', () => {
      const { container } = render(Breadcrumb, {
        props: { style: { fontSize: '20px', color: 'red' } },
        slots: {
          default: () => [h(BreadcrumbItem, {}, () => 'Home')]
        }
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveStyle({ fontSize: '20px' })
      expect(nav).toHaveStyle({ color: 'red' })
    })

    it('should apply custom className to item', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { className: 'custom-item' }, () => 'Home')]
        }
      })

      const item = container.querySelector('li')
      expect(item).toHaveClass('custom-item')
    })

    it('should apply custom style to item', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: () => [h(BreadcrumbItem, { style: { color: 'red' } }, () => 'Home')]
        }
      })

      const item = container.querySelector('li')
      expect(item).toHaveStyle({ color: 'red' })
    })

    it('should merge attrs.class with className on item', () => {
      const { container } = render(BreadcrumbItem, {
        props: {
          className: 'from-prop'
        },
        attrs: {
          class: 'from-attrs'
        },
        slots: {
          default: () => 'Home'
        }
      })

      const item = container.querySelector('li')
      expect(item).toHaveClass('from-prop')
      expect(item).toHaveClass('from-attrs')
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Breadcrumb)
      await expectNoA11yViolationsIsolated(container)
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

    it('should collapse middle items into an ellipsis when maxItems is set', () => {
      const { container } = render(Breadcrumb, {
        props: { maxItems: 3 },
        slots: { default: items }
      })

      const ellipsis = container.querySelector(
        'button[aria-label="Show collapsed breadcrumb items"]'
      )
      expect(ellipsis).toBeInTheDocument()
      // first + ellipsis + last 2 items = 4 <li>
      expect(container.querySelectorAll('li')).toHaveLength(4)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.getByText('Current')).toBeInTheDocument()
      expect(screen.queryByText('A')).not.toBeInTheDocument()
      expect(screen.queryByText('B')).not.toBeInTheDocument()
    })

    it('should expand all items when ellipsis is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(Breadcrumb, {
        props: { maxItems: 3 },
        slots: { default: items }
      })

      await user.click(
        container.querySelector('button[aria-label="Show collapsed breadcrumb items"]')!
      )

      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(
        container.querySelector('button[aria-label="Show collapsed breadcrumb items"]')
      ).toBeNull()
    })

    it('should not collapse when maxItems is >= item count', () => {
      const { container } = render(Breadcrumb, {
        props: { maxItems: 10 },
        slots: { default: items }
      })

      expect(
        container.querySelector('button[aria-label="Show collapsed breadcrumb items"]')
      ).toBeNull()
      expect(container.querySelectorAll('li')).toHaveLength(5)
    })
  })
})
