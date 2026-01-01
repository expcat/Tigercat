/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Space } from '@tigercat/vue'
import { h } from 'vue'
import {
  renderWithProps,
  renderWithSlots,
} from '../utils'

const directions = ['horizontal', 'vertical'] as const
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const aligns = ['start', 'end', 'center', 'baseline'] as const

describe('Space (Vue)', () => {
  const ItemSlot = () => [
    h('div', 'Item 1'),
    h('div', 'Item 2'),
    h('div', 'Item 3'),
  ]

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Space, {
        slots: {
          default: ItemSlot,
        },
      })
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
      expect(space).toHaveClass('inline-flex')
    })

    it('should render children items', () => {
      render(Space, {
        slots: {
          default: ItemSlot,
        },
      })
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Directions', () => {
    it.each(directions)('should apply %s direction', (direction) => {
      const { container } = renderWithProps(
        Space,
        { direction },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div')
      expect(space?.className).toBeTruthy()
    })

    it('should use horizontal direction by default', () => {
      const { container } = renderWithSlots(Space, {
        default: ItemSlot,
      })
      
      const space = container.querySelector('div')
      expect(space?.className).toContain('flex-row')
    })

    it('should apply vertical direction class', () => {
      const { container } = renderWithProps(
        Space,
        { direction: 'vertical' },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div')
      expect(space?.className).toContain('flex-col')
    })
  })

  describe('Sizes', () => {
    it.each(sizes)('should apply %s size', (size) => {
      const { container } = renderWithProps(
        Space,
        { size },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })

    it('should use md size by default', () => {
      const { container } = renderWithSlots(Space, {
        default: ItemSlot,
      })
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })

    it('should handle custom numeric size', () => {
      const { container } = renderWithProps(
        Space,
        { size: 16 },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div') as HTMLElement
      expect(space.style.gap).toBe('16px')
    })
  })

  describe('Alignment', () => {
    it.each(aligns)('should apply %s alignment', (align) => {
      const { container } = renderWithProps(
        Space,
        { align },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div')
      expect(space?.className).toBeTruthy()
    })

    it('should use start alignment by default', () => {
      const { container } = renderWithSlots(Space, {
        default: ItemSlot,
      })
      
      const space = container.querySelector('div')
      expect(space?.className).toContain('items-start')
    })
  })

  describe('Wrap', () => {
    it('should apply wrap class when wrap is true', () => {
      const { container } = renderWithProps(
        Space,
        { wrap: true },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div')
      expect(space).toHaveClass('flex-wrap')
    })

    it('should not wrap by default', () => {
      const { container } = renderWithSlots(Space, {
        default: ItemSlot,
      })
      
      const space = container.querySelector('div')
      expect(space).not.toHaveClass('flex-wrap')
    })
  })

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = renderWithProps(
        Space,
        {
          direction: 'vertical',
          size: 'lg',
          align: 'center',
          wrap: true,
        },
        {
          slots: { default: ItemSlot },
        }
      )
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
      expect(space).toHaveClass('flex-col')
      expect(space).toHaveClass('items-center')
      expect(space).toHaveClass('flex-wrap')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(Space)
      
      const space = container.querySelector('div')
      expect(space).toBeInTheDocument()
    })

    it('should handle single child', () => {
      const { container } = render(Space, {
        slots: {
          default: () => h('div', 'Single Item'),
        },
      })
      
      expect(screen.getByText('Single Item')).toBeInTheDocument()
    })

    it('should handle many children', () => {
      const ManyItems = () => Array.from({ length: 10 }, (_, i) => 
        h('div', { key: i }, `Item ${i + 1}`)
      )

      const { container } = render(Space, {
        slots: {
          default: ManyItems,
        },
      })
      
      const space = container.querySelector('div')
      expect(space?.children.length).toBe(10)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for horizontal space', () => {
      const { container } = renderWithProps(
        Space,
        { direction: 'horizontal', size: 'md' },
        {
          slots: { default: ItemSlot },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for vertical space', () => {
      const { container } = renderWithProps(
        Space,
        { direction: 'vertical', size: 'lg', align: 'center' },
        {
          slots: { default: ItemSlot },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
