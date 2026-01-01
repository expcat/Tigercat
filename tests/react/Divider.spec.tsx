/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Divider } from '@tigercat/react'
import {
  renderWithProps,
} from '../utils/render-helpers-react'
import {
  expectNoA11yViolations,
} from '../utils'
import React from 'react'

const orientations = ['horizontal', 'vertical'] as const
const lineStyles = ['solid', 'dashed', 'dotted'] as const
const spacings = ['xs', 'sm', 'md', 'lg', 'xl'] as const

describe('Divider (React)', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Divider />)
      
      const divider = container.querySelector('div[role="separator"]')
      expect(divider).toBeInTheDocument()
    })

    it('should have separator role', () => {
      const { container } = render(<Divider />)
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toBeTruthy()
    })
  })

  describe('Orientations', () => {
    it.each(orientations)('should render %s orientation', (orientation) => {
      const { container } = renderWithProps(Divider, { orientation })
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toHaveAttribute('aria-orientation', orientation)
    })

    it('should use horizontal orientation by default', () => {
      const { container } = render(<Divider />)
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
    })
  })

  describe('Line Styles', () => {
    it.each(lineStyles)('should apply %s line style', (lineStyle) => {
      const { container } = renderWithProps(Divider, { lineStyle })
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider?.className).toBeTruthy()
    })

    it('should use solid line style by default', () => {
      const { container } = render(<Divider />)
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider?.className).toContain('border-solid')
    })
  })

  describe('Spacing', () => {
    it.each(spacings)('should apply %s spacing', (spacing) => {
      const { container } = renderWithProps(Divider, { spacing })
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toBeInTheDocument()
    })

    it('should use md spacing by default', () => {
      const { container } = render(<Divider />)
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toBeInTheDocument()
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Divider, {
        className: 'custom-divider-class',
      })
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toHaveClass('custom-divider-class')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom color', () => {
      const { container } = renderWithProps(Divider, { color: '#ff0000' })
      
      const divider = container.querySelector('[role="separator"]') as HTMLElement
      expect(divider?.style.borderColor).toBe('#ff0000')
    })

    it('should apply custom thickness for horizontal divider', () => {
      const { container } = renderWithProps(Divider, {
        orientation: 'horizontal',
        thickness: '2px',
      })
      
      const divider = container.querySelector('[role="separator"]') as HTMLElement
      expect(divider?.style.borderTopWidth).toBe('2px')
    })

    it('should apply custom thickness for vertical divider', () => {
      const { container } = renderWithProps(Divider, {
        orientation: 'vertical',
        thickness: '3px',
      })
      
      const divider = container.querySelector('[role="separator"]') as HTMLElement
      expect(divider?.style.borderLeftWidth).toBe('3px')
    })

    it('should apply both color and thickness', () => {
      const { container } = renderWithProps(Divider, {
        color: '#00ff00',
        thickness: '4px',
      })
      
      const divider = container.querySelector('[role="separator"]') as HTMLElement
      expect(divider?.style.borderColor).toBe('#00ff00')
      expect(divider?.style.borderTopWidth).toBe('4px')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Divider />)

      await expectNoA11yViolations(container)
    })

    it('should have proper ARIA attributes', () => {
      const { container } = renderWithProps(Divider, {
        orientation: 'vertical',
      })

      const divider = container.querySelector('[role="separator"]')
      expect(divider).toHaveAttribute('role', 'separator')
      expect(divider).toHaveAttribute('aria-orientation', 'vertical')
    })
  })

  describe('Edge Cases', () => {
    it('should handle all props together', () => {
      const { container } = renderWithProps(Divider, {
        orientation: 'vertical',
        lineStyle: 'dashed',
        spacing: 'lg',
        color: '#cccccc',
        thickness: '1px',
        className: 'test-class',
      })
      
      const divider = container.querySelector('[role="separator"]')
      expect(divider).toBeInTheDocument()
      expect(divider).toHaveClass('test-class')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for horizontal divider', () => {
      const { container } = renderWithProps(Divider, {
        orientation: 'horizontal',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for vertical divider', () => {
      const { container } = renderWithProps(Divider, {
        orientation: 'vertical',
        lineStyle: 'dashed',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
