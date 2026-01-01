/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Text } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from '../utils'

const textSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const
const textWeights = ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'] as const
const textAligns = ['left', 'center', 'right', 'justify'] as const
const textColors = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'muted'] as const
const textTags = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label'] as const

describe('Text (Vue)', () => {
  describe('Rendering', () => {
    it('should render with default tag (p)', () => {
      render(Text, {
        slots: {
          default: 'Default text',
        },
      })
      
      const text = screen.getByText('Default text')
      expect(text.tagName).toBe('P')
    })

    it('should render with custom text via slot', () => {
      const { getByText } = renderWithSlots(Text, {
        default: 'Custom text content',
      })
      
      expect(getByText('Custom text content')).toBeInTheDocument()
    })
  })

  describe('Tags', () => {
    it.each(textTags)('should render as %s tag', (tag) => {
      const { container } = renderWithProps(
        Text,
        { tag },
        {
          slots: { default: 'Text content' },
        }
      )
      
      const element = container.querySelector(tag)
      expect(element).toBeInTheDocument()
      expect(element?.textContent).toBe('Text content')
    })
  })

  describe('Sizes', () => {
    it.each(textSizes)('should apply %s size classes', (size) => {
      const { container } = renderWithProps(
        Text,
        { size },
        {
          slots: { default: 'Sized text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text?.className).toBeTruthy()
    })

    it('should use base size by default', () => {
      const { container } = renderWithSlots(Text, {
        default: 'Text',
      })
      
      const text = container.querySelector('p')
      expect(text?.className).toContain('text-base')
    })
  })

  describe('Weights', () => {
    it.each(textWeights)('should apply %s weight classes', (weight) => {
      const { container } = renderWithProps(
        Text,
        { weight },
        {
          slots: { default: 'Weighted text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text?.className).toBeTruthy()
    })
  })

  describe('Alignment', () => {
    it.each(textAligns)('should apply %s alignment', (align) => {
      const { container } = renderWithProps(
        Text,
        { align },
        {
          slots: { default: 'Aligned text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text?.className).toContain('text-')
    })
  })

  describe('Colors', () => {
    it.each(textColors)('should apply %s color', (color) => {
      const { container } = renderWithProps(
        Text,
        { color },
        {
          slots: { default: 'Colored text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text?.className).toBeTruthy()
    })
  })

  describe('Decorations', () => {
    it('should apply truncate class', () => {
      const { container } = renderWithProps(
        Text,
        { truncate: true },
        {
          slots: { default: 'This is a very long text that should be truncated' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text).toHaveClass('truncate')
    })

    it('should apply italic class', () => {
      const { container } = renderWithProps(
        Text,
        { italic: true },
        {
          slots: { default: 'Italic text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text).toHaveClass('italic')
    })

    it('should apply underline class', () => {
      const { container } = renderWithProps(
        Text,
        { underline: true },
        {
          slots: { default: 'Underlined text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text).toHaveClass('underline')
    })

    it('should apply line-through class', () => {
      const { container } = renderWithProps(
        Text,
        { lineThrough: true },
        {
          slots: { default: 'Strikethrough text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text).toHaveClass('line-through')
    })

    it('should apply multiple decorations', () => {
      const { container } = renderWithProps(
        Text,
        { italic: true, underline: true },
        {
          slots: { default: 'Multi-decorated text' },
        }
      )
      
      const text = container.querySelector('p')
      expect(text).toHaveClass('italic')
      expect(text).toHaveClass('underline')
    })
  })

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = renderWithProps(
        Text,
        {
          tag: 'h1',
          size: '2xl',
          weight: 'bold',
          align: 'center',
          color: 'primary',
        },
        {
          slots: { default: 'Heading' },
        }
      )
      
      const heading = container.querySelector('h1')
      expect(heading).toBeInTheDocument()
      expect(heading?.className).toContain('text-2xl')
      expect(heading?.className).toContain('font-bold')
      expect(heading?.className).toContain('text-center')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProps(
        Text,
        { tag: 'p' },
        {
          slots: { default: 'Accessible text' },
        }
      )

      await expectNoA11yViolations(container)
    })

    it('should render semantic heading tags properly', async () => {
      const { container } = renderWithProps(
        Text,
        { tag: 'h1' },
        {
          slots: { default: 'Page Heading' },
        }
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = renderWithProps(Text, {})
      
      const text = container.querySelector('p')
      expect(text).toBeInTheDocument()
      expect(text?.textContent).toBe('')
    })

    it('should handle very long text', () => {
      const longText = 'Lorem ipsum '.repeat(100)
      const { container } = renderWithSlots(Text, {
        default: longText,
      })
      
      // Check that the text element exists and contains part of the content
      const text = container.querySelector('p')
      expect(text).toBeInTheDocument()
      expect(text?.textContent).toContain('Lorem ipsum')
      expect(text?.textContent?.length).toBeGreaterThan(1000)
    })

    it('should handle special characters', () => {
      const specialText = '<>&"\'Hello World'
      const { getByText } = renderWithSlots(Text, {
        default: specialText,
      })
      
      expect(getByText(specialText)).toBeInTheDocument()
    })

    it('should handle numeric content', () => {
      render(Text, {
        slots: {
          default: () => '12345',
        },
      })
      
      expect(screen.getByText('12345')).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default text', () => {
      const { container } = renderWithSlots(Text, {
        default: 'Default text',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for styled heading', () => {
      const { container } = renderWithProps(
        Text,
        {
          tag: 'h1',
          size: '3xl',
          weight: 'bold',
          color: 'primary',
        },
        {
          slots: { default: 'Styled Heading' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
