/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Link } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

const linkVariants = ['primary', 'secondary', 'default'] as const

describe('Link (Vue)', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Link, {
        slots: {
          default: 'Click me',
        },
      })
      
      const link = screen.getByText('Click me')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link).toHaveClass('inline-flex')
    })

    it('should render with custom text via slot', () => {
      const { getByText } = renderWithSlots(Link, {
        default: 'Custom Link Text',
      })
      
      expect(getByText('Custom Link Text')).toBeInTheDocument()
    })

    it('should render with href attribute', () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com' },
        {
          slots: { default: 'Example' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })
  })

  describe('Variants', () => {
    it.each(linkVariants)('should render %s variant correctly', (variant) => {
      const { container } = renderWithProps(
        Link,
        { variant },
        {
          slots: { default: `${variant} link` },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.className).toBeTruthy()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Link,
        { size },
        {
          slots: { default: `${size} link` },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = renderWithProps(
        Link,
        { disabled: true, href: 'https://example.com' },
        {
          slots: { default: 'Disabled Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveClass('cursor-not-allowed')
      expect(link).toHaveClass('opacity-60')
      // href should be removed when disabled
      expect(link).not.toHaveAttribute('href')
    })

    it('should not emit click when disabled', async () => {
      const onClick = vi.fn()
      
      render(Link, {
        props: {
          disabled: true,
        },
        slots: {
          default: 'Disabled Link',
        },
        attrs: {
          onClick,
        },
      })
      
      const link = screen.getByText('Disabled Link')
      await fireEvent.click(link)
      
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should show underline on hover by default', () => {
      const { container } = renderWithProps(
        Link,
        {},
        {
          slots: { default: 'Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveClass('hover:underline')
    })

    it('should not show underline when underline=false', () => {
      const { container } = renderWithProps(
        Link,
        { underline: false },
        {
          slots: { default: 'Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).not.toHaveClass('hover:underline')
    })
  })

  describe('Target and Rel', () => {
    it('should set target attribute', () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com', target: '_blank' },
        {
          slots: { default: 'External Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should auto-add rel="noopener noreferrer" for target="_blank"', () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com', target: '_blank' },
        {
          slots: { default: 'External Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should use custom rel when provided', () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com', target: '_blank', rel: 'custom-rel' },
        {
          slots: { default: 'External Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('rel', 'custom-rel')
    })

    it('should not add rel for other targets', () => {
      const { container } = renderWithProps(
        Link,
        { href: '/internal', target: '_self' },
        {
          slots: { default: 'Internal Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('Events', () => {
    it('should emit click event when clicked', async () => {
      const onClick = vi.fn()
      
      render(Link, {
        props: {
          href: 'https://example.com',
        },
        slots: {
          default: 'Clickable Link',
        },
        attrs: {
          onClick,
        },
      })
      
      const link = screen.getByText('Clickable Link')
      await fireEvent.click(link)
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should pass event object to click handler', async () => {
      const onClick = vi.fn()
      
      render(Link, {
        slots: {
          default: 'Click me',
        },
        attrs: {
          onClick,
        },
      })
      
      const link = screen.getByText('Click me')
      await fireEvent.click(link)
      
      expect(onClick).toHaveBeenCalled()
      const event = onClick.mock.calls[0][0]
      expect(event).toBeInstanceOf(MouseEvent)
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables([
        '--tiger-primary',
        '--tiger-primary-hover',
        '--tiger-primary-disabled',
      ])
    })

    it('should apply custom primary color from CSS variables', () => {
      setThemeVariables({
        '--tiger-primary': '#10b981',
      })

      const { container } = renderWithProps(
        Link,
        { variant: 'primary' },
        {
          slots: { default: 'Primary Link' },
        }
      )

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      // Link should have variant classes applied
      expect(link?.className).toContain('text-')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com' },
        {
          slots: { default: 'Accessible Link' },
        }
      )

      await expectNoA11yViolations(container)
    })

    it('should have aria-disabled when disabled', () => {
      const { container } = renderWithProps(
        Link,
        { disabled: true },
        {
          slots: { default: 'Disabled Link' },
        }
      )

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have focus ring styles', () => {
      const { container } = renderWithProps(
        Link,
        {},
        {
          slots: { default: 'Focusable Link' },
        }
      )

      const link = container.querySelector('a')
      expect(link).toHaveClass('focus:outline-none')
      expect(link).toHaveClass('focus:ring-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = renderWithProps(Link, {})
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.textContent).toBe('')
    })

    it('should handle long text content', () => {
      const longText = 'This is a very long link text that might wrap to multiple lines depending on the container width'
      const { getByText } = renderWithSlots(Link, {
        default: longText,
      })
      
      expect(getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      const specialText = '<>&"\'Hello World'
      const { getByText } = renderWithSlots(Link, {
        default: specialText,
      })
      
      expect(getByText(specialText)).toBeInTheDocument()
    })

    it('should handle href with query parameters', () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com?foo=bar&baz=qux' },
        {
          slots: { default: 'Link with params' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com?foo=bar&baz=qux')
    })

    it('should handle href with hash', () => {
      const { container } = renderWithProps(
        Link,
        { href: '#section' },
        {
          slots: { default: 'Anchor Link' },
        }
      )
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '#section')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default link', () => {
      const { container } = renderWithProps(
        Link,
        { href: 'https://example.com' },
        {
          slots: { default: 'Default Link' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled link', () => {
      const { container } = renderWithProps(
        Link,
        { disabled: true },
        {
          slots: { default: 'Disabled Link' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
