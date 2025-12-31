/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Tag } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

const tagVariants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const

describe('Tag', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Tag, {
        slots: {
          default: 'Test Tag',
        },
      })
      
      const tag = screen.getByText('Test Tag')
      expect(tag).toBeInTheDocument()
      expect(tag.parentElement).toHaveAttribute('role', 'status')
    })

    it('should render with custom text via slot', () => {
      const { getByText } = renderWithSlots(Tag, {
        default: 'Custom Tag Text',
      })
      
      expect(getByText('Custom Tag Text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it.each(tagVariants)('should render %s variant correctly', (variant) => {
      const { container } = renderWithProps(
        Tag,
        { variant },
        {
          slots: { default: `${variant} tag` },
        }
      )
      
      const tag = container.querySelector('[role="status"]')
      expect(tag).toBeInTheDocument()
      // Verify tag has variant-specific classes
      expect(tag?.className).toBeTruthy()
    })

    it('should apply default variant when not specified', () => {
      const { container } = renderWithSlots(Tag, {
        default: 'Default Tag',
      })
      
      const tag = container.querySelector('[role="status"]')
      expect(tag).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Tag,
        { size },
        {
          slots: { default: `${size} tag` },
        }
      )
      
      const tag = container.querySelector('[role="status"]')
      expect(tag).toBeInTheDocument()
    })
  })

  describe('Closable', () => {
    it('should not render close button when closable is false', () => {
      const { container } = renderWithProps(
        Tag,
        { closable: false },
        {
          slots: { default: 'Non-closable Tag' },
        }
      )
      
      const closeButton = container.querySelector('button')
      expect(closeButton).not.toBeInTheDocument()
    })

    it('should render close button when closable is true', () => {
      const { container } = renderWithProps(
        Tag,
        { closable: true },
        {
          slots: { default: 'Closable Tag' },
        }
      )
      
      const closeButton = container.querySelector('button[aria-label="Close tag"]')
      expect(closeButton).toBeInTheDocument()
    })

    it('should emit close event when close button is clicked', async () => {
      const onClose = vi.fn()
      
      const { container } = render(Tag, {
        props: {
          closable: true,
          onClose,
        },
        slots: {
          default: 'Closable Tag',
        },
      })
      
      const closeButton = container.querySelector('button[aria-label="Close tag"]')
      expect(closeButton).toBeInTheDocument()
      
      if (closeButton) {
        await fireEvent.click(closeButton)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should stop event propagation when close button is clicked', async () => {
      const onClose = vi.fn()
      const onTagClick = vi.fn()
      
      const { container } = render(Tag, {
        props: {
          closable: true,
          onClose,
        },
        slots: {
          default: 'Closable Tag',
        },
        attrs: {
          onClick: onTagClick,
        },
      })
      
      const closeButton = container.querySelector('button[aria-label="Close tag"]')
      
      if (closeButton) {
        await fireEvent.click(closeButton)
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(onTagClick).not.toHaveBeenCalled()
      }
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables([
        '--tiger-primary',
        '--tiger-primary-hover',
      ])
    })

    it('should support primary theme customization', () => {
      setThemeVariables({
        '--tiger-primary': '#10b981',
        '--tiger-primary-hover': '#059669',
      })
      
      const { container } = renderWithProps(
        Tag,
        { variant: 'primary' },
        {
          slots: { default: 'Primary Tag' },
        }
      )
      
      const tag = container.querySelector('[role="status"]')
      expect(tag).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(Tag, {
        default: 'Accessible Tag',
      })
      
      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations with close button', async () => {
      const { container } = renderWithProps(
        Tag,
        { closable: true },
        {
          slots: { default: 'Closable Tag' },
        }
      )
      
      await expectNoA11yViolations(container)
    })

    it('should have proper aria-label on close button', () => {
      const { container } = renderWithProps(
        Tag,
        { closable: true },
        {
          slots: { default: 'Tag' },
        }
      )
      
      const closeButton = container.querySelector('button')
      expect(closeButton).toHaveAttribute('aria-label', 'Close tag')
    })
  })

  describe('Combined Props', () => {
    it('should correctly combine variant, size, and closable', () => {
      const { container, getByText } = renderWithProps(
        Tag,
        { variant: 'success', size: 'lg', closable: true },
        {
          slots: { default: 'Combined Tag' },
        }
      )
      
      expect(getByText('Combined Tag')).toBeInTheDocument()
      const closeButton = container.querySelector('button[aria-label="Close tag"]')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default tag', () => {
      const { container } = renderWithSlots(Tag, {
        default: 'Default Tag',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for primary variant', () => {
      const { container } = renderWithProps(
        Tag,
        { variant: 'primary' },
        {
          slots: { default: 'Primary Tag' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for closable tag', () => {
      const { container } = renderWithProps(
        Tag,
        { closable: true },
        {
          slots: { default: 'Closable Tag' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
