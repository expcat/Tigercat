/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Badge } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const badgeVariants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const
const badgeTypes = ['dot', 'number', 'text'] as const
const badgePositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Badge, {
        props: {
          content: 5,
        },
      })
      
      const badge = screen.getByText('5')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('role', 'status')
    })

    it('should render as standalone badge by default', () => {
      const { container } = renderWithProps(Badge, { content: 10 })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
      expect(badge?.parentElement?.className).not.toContain('relative')
    })

    it('should render with wrapper when standalone is false', () => {
      const { container } = renderWithProps(
        Badge,
        { content: 5, standalone: false },
        {
          slots: { default: '<button>Button</button>' },
        }
      )
      
      expect(screen.getByText('Button')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      
      const wrapper = container.querySelector('.relative')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it.each(badgeVariants)('should render %s variant correctly', (variant) => {
      const { container } = renderWithProps(Badge, {
        variant,
        content: 1,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
    })

    it('should apply danger variant by default', () => {
      const { container } = renderWithProps(Badge, { content: 1 })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Badge, {
        size,
        content: 1,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Types', () => {
    it.each(badgeTypes)('should render %s type correctly', (type) => {
      const { container } = renderWithProps(Badge, {
        type,
        content: type === 'dot' ? undefined : 5,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
    })

    it('should render dot badge without content', () => {
      const { container } = renderWithProps(Badge, { type: 'dot' })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
      expect(badge?.textContent).toBe('')
    })

    it('should render number badge with numeric content', () => {
      render(Badge, {
        props: {
          type: 'number',
          content: 42,
        },
      })
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render text badge with string content', () => {
      render(Badge, {
        props: {
          type: 'text',
          content: 'NEW',
        },
      })
      
      expect(screen.getByText('NEW')).toBeInTheDocument()
    })
  })

  describe('Content and Formatting', () => {
    it('should display numeric content', () => {
      render(Badge, {
        props: {
          content: 5,
        },
      })
      
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display string content', () => {
      render(Badge, {
        props: {
          content: 'Hot',
        },
      })
      
      expect(screen.getByText('Hot')).toBeInTheDocument()
    })

    it('should display max+ when content exceeds max', () => {
      render(Badge, {
        props: {
          content: 150,
          max: 99,
        },
      })
      
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should use custom max value', () => {
      render(Badge, {
        props: {
          content: 500,
          max: 999,
        },
      })
      
      expect(screen.getByText('500')).toBeInTheDocument()
      
      const { rerender } = render(Badge, {
        props: {
          content: 1500,
          max: 999,
        },
      })
      
      expect(screen.getByText('999+')).toBeInTheDocument()
    })

    it('should hide badge when content is 0 and showZero is false', () => {
      const { container } = renderWithProps(Badge, {
        content: 0,
        showZero: false,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).not.toBeInTheDocument()
    })

    it('should show badge when content is 0 and showZero is true', () => {
      render(Badge, {
        props: {
          content: 0,
          showZero: true,
        },
      })
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should hide badge when content is undefined', () => {
      const { container } = renderWithProps(Badge, {
        content: undefined,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).not.toBeInTheDocument()
    })

    it('should hide badge when content is empty string for text type', () => {
      const { container } = renderWithProps(Badge, {
        type: 'text',
        content: '',
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).not.toBeInTheDocument()
    })
  })

  describe('Position', () => {
    it.each(badgePositions)('should position badge at %s when not standalone', (position) => {
      const { container } = renderWithProps(
        Badge,
        {
          position,
          content: 5,
          standalone: false,
        },
        {
          slots: { default: '<div>Content</div>' },
        }
      )
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
      expect(badge?.className).toContain('absolute')
    })

    it('should use top-right position by default', () => {
      const { container } = renderWithProps(
        Badge,
        {
          content: 5,
          standalone: false,
        },
        {
          slots: { default: '<div>Content</div>' },
        }
      )
      
      const badge = container.querySelector('[role="status"]')
      expect(badge?.className).toContain('-top-1')
      expect(badge?.className).toContain('-right-1')
    })
  })

  describe('Standalone Mode', () => {
    it('should render only badge in standalone mode', () => {
      const { container } = renderWithProps(Badge, {
        content: 5,
        standalone: true,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
      
      const wrapper = container.querySelector('.relative')
      expect(wrapper).not.toBeInTheDocument()
    })

    it('should wrap children when standalone is false', () => {
      const { container } = renderWithSlots(
        Badge,
        {
          default: '<button>Button</button>',
        },
        {
          props: {
            content: 3,
            standalone: false,
          },
        }
      )
      
      expect(screen.getByText('Button')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      
      const wrapper = container.querySelector('.relative')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="status" attribute', () => {
      const { container } = renderWithProps(Badge, { content: 5 })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
    })

    it('should have appropriate aria-label for number badges', () => {
      render(Badge, {
        props: {
          type: 'number',
          content: 5,
        },
      })
      
      const badge = screen.getByLabelText('5 notifications')
      expect(badge).toBeInTheDocument()
    })

    it('should have appropriate aria-label for dot badges', () => {
      const { container } = renderWithProps(Badge, { type: 'dot' })
      
      const badge = container.querySelector('[aria-label="notification"]')
      expect(badge).toBeInTheDocument()
    })

    it('should pass accessibility checks', async () => {
      const { container } = renderWithProps(Badge, {
        content: 5,
      })
      
      await expectNoA11yViolations(container)
    })

    it('should pass accessibility checks in wrapper mode', async () => {
      const { container } = renderWithProps(
        Badge,
        {
          content: 3,
          standalone: false,
        },
        {
          slots: {
            default: '<button aria-label="Notifications">Button</button>',
          },
        }
      )
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative numbers', () => {
      render(Badge, {
        props: {
          content: -5,
        },
      })
      
      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      render(Badge, {
        props: {
          content: 999999,
          max: 99,
        },
      })
      
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should handle empty slot when not standalone', () => {
      const { container } = renderWithProps(Badge, {
        content: 5,
        standalone: false,
      })
      
      const badge = container.querySelector('[role="status"]')
      expect(badge).toBeInTheDocument()
    })

    it('should handle string numbers', () => {
      render(Badge, {
        props: {
          content: '42',
        },
      })
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should handle special characters in text content', () => {
      render(Badge, {
        props: {
          type: 'text',
          content: '!@#',
        },
      })
      
      expect(screen.getByText('!@#')).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default badge', () => {
      const { container } = renderWithProps(Badge, { content: 5 })
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for dot badge', () => {
      const { container } = renderWithProps(Badge, { type: 'dot' })
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for badge with wrapper', () => {
      const { container } = renderWithProps(
        Badge,
        { content: 3, standalone: false },
        { slots: { default: '<button>Button</button>' } }
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for all variants', () => {
      badgeVariants.forEach((variant) => {
        const { container } = renderWithProps(Badge, {
          variant,
          content: 1,
        })
        expect(container.firstChild).toMatchSnapshot(`badge-${variant}`)
      })
    })
  })
})
