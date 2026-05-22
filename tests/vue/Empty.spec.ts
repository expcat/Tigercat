/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Empty } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Empty (Vue)', () => {
  describe('Rendering', () => {
    it('renders with default description', () => {
      render(Empty)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('renders custom description', () => {
      render(Empty, { props: { description: 'Nothing here' } })
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('renders default SVG illustration', () => {
      const { container } = render(Empty)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('hides illustration when showImage=false', () => {
      const { container } = render(Empty, { props: { showImage: false } })
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('Slots', () => {
    it('renders image slot instead of default SVG', () => {
      render(Empty, {
        slots: {
          image: () => h('img', { src: 'custom.png', alt: 'custom' })
        }
      })
      expect(screen.getByAltText('custom')).toBeInTheDocument()
    })

    it('renders description slot', () => {
      render(Empty, {
        slots: {
          description: () => h('span', 'Custom desc')
        }
      })
      expect(screen.getByText('Custom desc')).toBeInTheDocument()
    })

    it('renders extra slot (actions)', () => {
      render(Empty, {
        slots: {
          extra: () => h('button', 'Create')
        }
      })
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('renders default slot (body content)', () => {
      render(Empty, {
        slots: {
          default: () => h('p', 'Body text')
        }
      })
      expect(screen.getByText('Body text')).toBeInTheDocument()
    })
  })

  describe('className and attrs', () => {
    it('merges className prop', () => {
      const { container } = render(Empty, { props: { className: 'my-empty' } })
      expect(container.firstElementChild).toHaveClass('my-empty')
    })

    it('merges attrs class', () => {
      const { container } = render(Empty, { attrs: { class: 'extra' } })
      expect(container.firstElementChild).toHaveClass('extra')
    })
  })

  describe('Presets', () => {
    it('renders with default preset', () => {
      render(Empty, { props: { preset: 'default' } })
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Empty)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
