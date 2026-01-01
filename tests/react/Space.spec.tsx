/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Space } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
} from '../utils/render-helpers-react'
import React from 'react'

const directions = ['horizontal', 'vertical'] as const
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const aligns = ['start', 'end', 'center', 'baseline'] as const

describe('Space (React)', () => {
  const Items = (
    <>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </>
  )

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Space>{Items}</Space>)
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
      expect(space).toHaveClass('inline-flex')
    })

    it('should render children items', () => {
      render(<Space>{Items}</Space>)
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Directions', () => {
    it.each(directions)('should apply %s direction', (direction) => {
      const { container } = renderWithProps(Space, {
        direction,
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space?.className).toBeTruthy()
    })

    it('should use horizontal direction by default', () => {
      const { container } = renderWithChildren(Space, Items)
      
      const space = container.querySelector('div')
      expect(space?.className).toContain('flex-row')
    })

    it('should apply vertical direction class', () => {
      const { container } = renderWithProps(Space, {
        direction: 'vertical',
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space?.className).toContain('flex-col')
    })
  })

  describe('Sizes', () => {
    it.each(sizes)('should apply %s size', (size) => {
      const { container } = renderWithProps(Space, {
        size,
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })

    it('should use md size by default', () => {
      const { container } = renderWithChildren(Space, Items)
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })

    it('should handle custom numeric size', () => {
      const { container } = renderWithProps(Space, {
        size: 16,
        children: Items,
      })
      
      const space = container.querySelector('div') as HTMLElement
      expect(space.style.gap).toBe('16px')
    })
  })

  describe('Alignment', () => {
    it.each(aligns)('should apply %s alignment', (align) => {
      const { container } = renderWithProps(Space, {
        align,
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space?.className).toBeTruthy()
    })

    it('should use start alignment by default', () => {
      const { container } = renderWithChildren(Space, Items)
      
      const space = container.querySelector('div')
      expect(space?.className).toContain('items-start')
    })
  })

  describe('Wrap', () => {
    it('should apply wrap class when wrap is true', () => {
      const { container } = renderWithProps(Space, {
        wrap: true,
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space).toHaveClass('flex-wrap')
    })

    it('should not wrap by default', () => {
      const { container } = renderWithChildren(Space, Items)
      
      const space = container.querySelector('div')
      expect(space).not.toHaveClass('flex-wrap')
    })
  })

  describe('Custom ClassName and Style', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Space, {
        className: 'custom-space-class',
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space).toHaveClass('custom-space-class')
      expect(space).toHaveClass('inline-flex') // Should also have base classes
    })

    it('should apply custom style', () => {
      const { container } = renderWithProps(Space, {
        style: { backgroundColor: 'red' },
        children: Items,
      })
      
      const space = container.querySelector('div') as HTMLElement
      expect(space.style.backgroundColor).toBe('red')
    })
  })

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = renderWithProps(Space, {
        direction: 'vertical',
        size: 'lg',
        align: 'center',
        wrap: true,
        className: 'test-class',
        children: Items,
      })
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
      expect(space).toHaveClass('flex-col')
      expect(space).toHaveClass('items-center')
      expect(space).toHaveClass('flex-wrap')
      expect(space).toHaveClass('test-class')
    })
  })

  describe('Children Types', () => {
    it('should handle empty children', () => {
      const { container } = render(<Space />)
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })

    it('should handle single child', () => {
      render(<Space><div>Single Item</div></Space>)
      
      expect(screen.getByText('Single Item')).toBeInTheDocument()
    })

    it('should handle many children', () => {
      const ManyItems = Array.from({ length: 10 }, (_, i) => (
        <div key={i}>Item {i + 1}</div>
      ))

      const { container } = render(<Space>{ManyItems}</Space>)
      
      const space = container.querySelector('div')
      expect(space?.children.length).toBe(10)
    })

    it('should handle null children', () => {
      const { container } = renderWithProps(Space, {
        children: null,
      })
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for horizontal space', () => {
      const { container } = renderWithProps(Space, {
        direction: 'horizontal',
        size: 'md',
        children: Items,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for vertical space', () => {
      const { container } = renderWithProps(Space, {
        direction: 'vertical',
        size: 'lg',
        align: 'center',
        children: Items,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
