/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
} from '../utils/render-helpers-react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'
import React from 'react'

const linkVariants = ['primary', 'secondary', 'default'] as const

describe('Link (React)', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Link>Click me</Link>)
      
      const link = screen.getByText('Click me')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
      expect(link).toHaveClass('inline-flex')
    })

    it('should render with children', () => {
      const { getByText } = renderWithChildren(Link, 'Custom Link Text')
      
      expect(getByText('Custom Link Text')).toBeInTheDocument()
    })

    it('should render with href attribute', () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com',
        children: 'Example',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })
  })

  describe('Variants', () => {
    it.each(linkVariants)('should render %s variant correctly', (variant) => {
      const { container } = renderWithProps(Link, {
        variant,
        children: `${variant} link`,
      })
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.className).toBeTruthy()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Link, {
        size,
        children: `${size} link`,
      })
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = renderWithProps(Link, {
        disabled: true,
        href: 'https://example.com',
        children: 'Disabled Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveClass('cursor-not-allowed')
      expect(link).toHaveClass('opacity-60')
      // href should be removed when disabled
      expect(link).not.toHaveAttribute('href')
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(
        <Link disabled onClick={onClick}>
          Disabled Link
        </Link>
      )
      
      const link = screen.getByText('Disabled Link')
      await user.click(link)
      
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should show underline on hover by default', () => {
      const { container } = renderWithProps(Link, {
        children: 'Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveClass('hover:underline')
    })

    it('should not show underline when underline=false', () => {
      const { container } = renderWithProps(Link, {
        underline: false,
        children: 'Link',
      })
      
      const link = container.querySelector('a')
      expect(link).not.toHaveClass('hover:underline')
    })
  })

  describe('Target and Rel', () => {
    it('should set target attribute', () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com',
        target: '_blank',
        children: 'External Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should auto-add rel="noopener noreferrer" for target="_blank"', () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com',
        target: '_blank',
        children: 'External Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should use custom rel when provided', () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com',
        target: '_blank',
        rel: 'custom-rel',
        children: 'External Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('rel', 'custom-rel')
    })

    it('should not add rel for other targets', () => {
      const { container } = renderWithProps(Link, {
        href: '/internal',
        target: '_self',
        children: 'Internal Link',
      })
      
      const link = container.querySelector('a')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('Events', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(
        <Link href="https://example.com" onClick={onClick}>
          Clickable Link
        </Link>
      )
      
      const link = screen.getByText('Clickable Link')
      await user.click(link)
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should pass event object to onClick handler', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(<Link onClick={onClick}>Click me</Link>)
      
      const link = screen.getByText('Click me')
      await user.click(link)
      
      expect(onClick).toHaveBeenCalled()
      const event = onClick.mock.calls[0][0]
      expect(event).toHaveProperty('target')
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Link, {
        className: 'custom-class',
        children: 'Custom Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveClass('custom-class')
      expect(link).toHaveClass('inline-flex') // Should also have base classes
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

      const { container } = renderWithProps(Link, {
        variant: 'primary',
        children: 'Primary Link',
      })

      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      // Link should have variant classes applied
      expect(link?.className).toContain('text-')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com',
        children: 'Accessible Link',
      })

      await expectNoA11yViolations(container)
    })

    it('should have aria-disabled when disabled', () => {
      const { container } = renderWithProps(Link, {
        disabled: true,
        children: 'Disabled Link',
      })

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have focus ring styles', () => {
      const { container } = renderWithProps(Link, {
        children: 'Focusable Link',
      })

      const link = container.querySelector('a')
      expect(link).toHaveClass('focus:outline-none')
      expect(link).toHaveClass('focus:ring-2')
    })
  })

  describe('Children', () => {
    it('should render with text children', () => {
      render(<Link>Text Link</Link>)
      expect(screen.getByText('Text Link')).toBeInTheDocument()
    })

    it('should render with element children', () => {
      render(
        <Link>
          <span>Element Link</span>
        </Link>
      )
      expect(screen.getByText('Element Link')).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      render(
        <Link>
          <span>Part 1</span>
          <span>Part 2</span>
        </Link>
      )
      expect(screen.getByText('Part 1')).toBeInTheDocument()
      expect(screen.getByText('Part 2')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = renderWithProps(Link, {})
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.textContent).toBe('')
    })

    it('should handle null children', () => {
      const { container } = renderWithProps(Link, {
        children: null,
      })
      
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
    })

    it('should handle long text content', () => {
      const longText = 'This is a very long link text that might wrap to multiple lines depending on the container width'
      const { getByText } = renderWithChildren(Link, longText)
      
      expect(getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      const specialText = '<>&"\'Hello World'
      const { getByText } = renderWithChildren(Link, specialText)
      
      expect(getByText(specialText)).toBeInTheDocument()
    })

    it('should handle href with query parameters', () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com?foo=bar&baz=qux',
        children: 'Link with params',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com?foo=bar&baz=qux')
    })

    it('should handle href with hash', () => {
      const { container } = renderWithProps(Link, {
        href: '#section',
        children: 'Anchor Link',
      })
      
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '#section')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default link', () => {
      const { container } = renderWithProps(Link, {
        href: 'https://example.com',
        children: 'Default Link',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled link', () => {
      const { container } = renderWithProps(Link, {
        disabled: true,
        children: 'Disabled Link',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
