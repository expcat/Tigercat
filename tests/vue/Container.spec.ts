/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Container } from '@tigercat/vue'
import { h } from 'vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolations } from '../utils'

describe('Container (Vue)', () => {
  const ContentSlot = () => h('div', 'Container content')

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Container, {
        slots: {
          default: ContentSlot
        }
      })

      const containerEl = container.querySelector('div')
      expect(containerEl).toBeInTheDocument()
      expect(containerEl).toHaveClass('w-full')
    })

    it('should render children content', () => {
      render(Container, {
        slots: {
          default: ContentSlot
        }
      })

      expect(screen.getByText('Container content')).toBeInTheDocument()
    })
  })

  describe('Max Width', () => {
    it('should not apply max width when set to false', () => {
      const { container } = renderWithProps(
        Container,
        { maxWidth: false },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).not.toHaveClass('max-w-screen-')
    })

    it('should apply sm max width class', () => {
      const { container } = renderWithProps(
        Container,
        { maxWidth: 'sm' },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('max-w-screen-sm')
    })

    it('should apply full width class', () => {
      const { container } = renderWithProps(
        Container,
        { maxWidth: 'full' },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('w-full')
    })
  })

  describe('Center', () => {
    it('should center by default', () => {
      const { container } = renderWithSlots(Container, {
        default: ContentSlot
      })

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('mx-auto')
    })

    it('should not center when set to false', () => {
      const { container } = renderWithProps(
        Container,
        { center: false },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).not.toHaveClass('mx-auto')
    })
  })

  describe('Padding', () => {
    it('should apply padding by default', () => {
      const { container } = renderWithSlots(Container, {
        default: ContentSlot
      })

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('px-4')
    })

    it('should not apply padding when set to false', () => {
      const { container } = renderWithProps(
        Container,
        { padding: false },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).not.toHaveClass('px-4')
    })
  })

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = renderWithProps(
        Container,
        {
          maxWidth: 'lg',
          center: true,
          padding: true
        },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('w-full')
      expect(containerEl).toHaveClass('max-w-screen-lg')
      expect(containerEl).toHaveClass('mx-auto')
      expect(containerEl).toHaveClass('px-4')
    })

    it('should work with all features disabled', () => {
      const { container } = renderWithProps(
        Container,
        {
          maxWidth: false,
          center: false,
          padding: false
        },
        {
          slots: { default: ContentSlot }
        }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('w-full')
      expect(containerEl).not.toHaveClass('mx-auto')
      expect(containerEl).not.toHaveClass('px-4')
    })
  })

  describe('Custom Class', () => {
    it('should merge attrs.class', () => {
      const { container } = renderWithSlots(
        Container,
        { default: ContentSlot },
        { attrs: { class: ['custom-class', { 'custom-obj-class': true }] } }
      )

      const containerEl = container.querySelector('div')
      expect(containerEl).toHaveClass('w-full')
      expect(containerEl).toHaveClass('custom-class')
      expect(containerEl).toHaveClass('custom-obj-class')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(Container, {
        default: ContentSlot
      })

      await expectNoA11yViolations(container)
    })
  })
})
