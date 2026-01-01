/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Icon } from '@tigercat/vue'
import { h } from 'vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const iconSizes = ['sm', 'md', 'lg', 'xl'] as const

describe('Icon (Vue)', () => {
  const SimpleSVG = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' }, [
    h('path', { d: 'M5 12h14', stroke: 'currentColor', strokeWidth: '2' })
  ])

  describe('Rendering', () => {
    it('should render with SVG content', () => {
      const { container } = render(Icon, {
        slots: {
          default: SimpleSVG,
        },
      })
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('inline-block')
    })

    it('should render with default size (md)', () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      })
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-5')
      expect(svg).toHaveClass('h-5')
    })
  })

  describe('Sizes', () => {
    it.each(iconSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Icon,
        { size },
        {
          slots: { default: SimpleSVG },
        }
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should apply sm size classes (w-4 h-4)', () => {
      const { container } = renderWithProps(
        Icon,
        { size: 'sm' },
        {
          slots: { default: SimpleSVG },
        }
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-4', 'h-4')
    })

    it('should apply xl size classes (w-8 h-8)', () => {
      const { container } = renderWithProps(
        Icon,
        { size: 'xl' },
        {
          slots: { default: SimpleSVG },
        }
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('w-8', 'h-8')
    })
  })

  describe('Color', () => {
    it('should use currentColor by default', () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      })
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })

    it('should apply custom color', () => {
      const { container } = renderWithProps(
        Icon,
        { color: '#ff0000' },
        {
          slots: { default: SimpleSVG },
        }
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke', '#ff0000')
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(
        Icon,
        { className: 'custom-icon-class' },
        {
          slots: { default: SimpleSVG },
        }
      )
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-icon-class')
      expect(svg).toHaveClass('inline-block') // Should also have base classes
    })
  })

  describe('SVG Attributes', () => {
    it('should set default SVG attributes', () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      })
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('fill', 'none')
    })

    it('should set stroke attributes', () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      })
      
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('stroke-width', '2')
      expect(svg).toHaveAttribute('stroke-linecap', 'round')
      expect(svg).toHaveAttribute('stroke-linejoin', 'round')
    })
  })

  describe('Children', () => {
    it('should render complex SVG paths', () => {
      const ComplexSVG = () => h('svg', {}, [
        h('path', { d: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2' }),
        h('circle', { cx: '12', cy: '12', r: '10' })
      ])

      const { container } = renderWithSlots(Icon, {
        default: ComplexSVG,
      })
      
      const svg = container.querySelector('svg')
      const paths = svg?.querySelectorAll('path')
      const circles = svg?.querySelectorAll('circle')
      
      expect(paths?.length).toBe(1)
      expect(circles?.length).toBe(1)
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      })

      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing children gracefully', () => {
      const { container } = render(Icon)
      expect(container.querySelector('svg')).toBeFalsy()
    })

    it('should handle multiple SVG elements', () => {
      const MultipleSVGs = () => [
        h('svg', { key: '1' }, [h('path', { d: 'M5 12h14' })]),
        h('svg', { key: '2' }, [h('circle', { cx: '12', cy: '12', r: '10' })])
      ]

      const { container } = renderWithSlots(Icon, {
        default: MultipleSVGs,
      })
      
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default icon', () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for custom sized icon', () => {
      const { container } = renderWithProps(
        Icon,
        { size: 'xl', color: '#0066cc' },
        {
          slots: { default: SimpleSVG },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
