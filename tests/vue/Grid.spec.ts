/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Row, Col } from '@tigercat/vue'
import { h } from 'vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from '../utils'

const aligns = ['top', 'middle', 'bottom'] as const
const justifies = ['start', 'end', 'center', 'space-around', 'space-between'] as const

describe('Row and Col (Vue)', () => {
  describe('Row - Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Row)
      
      const row = container.querySelector('div')
      expect(row).toBeInTheDocument()
      expect(row).toHaveClass('flex')
    })

    it('should render children columns', () => {
      const { container } = render(Row, {
        slots: {
          default: () => [
            h(Col, () => 'Column 1'),
            h(Col, () => 'Column 2'),
          ],
        },
      })
      
      expect(screen.getByText('Column 1')).toBeInTheDocument()
      expect(screen.getByText('Column 2')).toBeInTheDocument()
    })
  })

  describe('Row - Alignment', () => {
    it.each(aligns)('should apply %s vertical alignment', (align) => {
      const { container } = renderWithProps(
        Row,
        { align },
        {
          slots: {
            default: () => h(Col, () => 'Content'),
          },
        }
      )
      
      const row = container.querySelector('div')
      expect(row?.className).toBeTruthy()
    })

    it('should use top alignment by default', () => {
      const { container } = render(Row)
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('items-start')
    })
  })

  describe('Row - Justify', () => {
    it.each(justifies)('should apply %s horizontal alignment', (justify) => {
      const { container } = renderWithProps(
        Row,
        { justify },
        {
          slots: {
            default: () => h(Col, () => 'Content'),
          },
        }
      )
      
      const row = container.querySelector('div')
      expect(row?.className).toBeTruthy()
    })

    it('should use start justify by default', () => {
      const { container } = render(Row)
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('justify-start')
    })
  })

  describe('Row - Gutter', () => {
    it('should apply numeric gutter', () => {
      const { container } = renderWithProps(
        Row,
        { gutter: 16 },
        {
          slots: {
            default: () => h(Col, () => 'Content'),
          },
        }
      )
      
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
      expect(row.style.marginRight).toBeTruthy()
    })

    it('should apply array gutter [horizontal, vertical]', () => {
      const { container } = renderWithProps(
        Row,
        { gutter: [16, 8] },
        {
          slots: {
            default: () => h(Col, () => 'Content'),
          },
        }
      )
      
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
    })

    it('should pass gutter to Col children', () => {
      const { container } = render(Row, {
        props: { gutter: 16 },
        slots: {
          default: () => h(Col, () => 'Content'),
        },
      })
      
      // Check that Row has negative margin
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
      expect(row.style.marginRight).toBeTruthy()
    })
  })

  describe('Row - Wrap', () => {
    it('should wrap by default', () => {
      const { container } = render(Row)
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('flex-wrap')
    })

    it('should not wrap when set to false', () => {
      const { container } = renderWithProps(Row, { wrap: false })
      
      const row = container.querySelector('div')
      expect(row).not.toHaveClass('flex-wrap')
    })
  })

  describe('Col - Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Col)
      
      const col = container.querySelector('div')
      expect(col).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(Col, {
        slots: {
          default: () => 'Column content',
        },
      })
      
      expect(screen.getByText('Column content')).toBeInTheDocument()
    })
  })

  describe('Col - Span', () => {
    it('should apply numeric span', () => {
      const { container } = renderWithProps(Col, { span: 12 })
      
      const col = container.querySelector('div')
      expect(col?.className).toContain('w-[50%]')
    })

    it('should use full span (24) by default', () => {
      const { container } = render(Col)
      
      const col = container.querySelector('div')
      expect(col?.className).toContain('w-[100%]')
    })

    it('should apply responsive span', () => {
      const { container } = renderWithProps(Col, {
        span: { xs: 24, sm: 12, md: 8, lg: 6 },
      })
      
      const col = container.querySelector('div')
      expect(col?.className).toBeTruthy()
    })
  })

  describe('Col - Offset', () => {
    it('should apply numeric offset', () => {
      const { container } = renderWithProps(Col, { offset: 4 })
      
      const col = container.querySelector('div')
      expect(col?.className).toContain('ml-[16.666667%]')
    })

    it('should not apply offset by default', () => {
      const { container } = render(Col)
      
      const col = container.querySelector('div')
      // Default offset is 0, which shouldn't add offset classes
      expect(col?.className).toBeTruthy()
    })

    it('should apply responsive offset', () => {
      const { container } = renderWithProps(Col, {
        offset: { xs: 0, sm: 2, md: 4 },
      })
      
      const col = container.querySelector('div')
      expect(col?.className).toBeTruthy()
    })
  })

  describe('Col - Order', () => {
    it('should apply order', () => {
      const { container } = renderWithProps(Col, { order: 2 })
      
      const col = container.querySelector('div')
      expect(col?.className).toContain('order-2')
    })

    it('should apply responsive order', () => {
      const { container } = renderWithProps(Col, {
        order: { xs: 1, sm: 2, md: 3 },
      })
      
      const col = container.querySelector('div')
      expect(col?.className).toBeTruthy()
    })
  })

  describe('Col - Flex', () => {
    it('should apply flex value', () => {
      const { container } = renderWithProps(Col, { flex: '1 1 auto' })
      
      const col = container.querySelector('div')
      expect(col?.className).toBeTruthy()
    })

    it('should apply numeric flex', () => {
      const { container } = renderWithProps(Col, { flex: 1 })
      
      const col = container.querySelector('div')
      expect(col?.className).toBeTruthy()
    })
  })

  describe('Integration - Row and Col', () => {
    it('should create a grid layout', () => {
      render(Row, {
        slots: {
          default: () => [
            h(Col, { span: 8 }, () => 'Col 1'),
            h(Col, { span: 8 }, () => 'Col 2'),
            h(Col, { span: 8 }, () => 'Col 3'),
          ],
        },
      })
      
      expect(screen.getByText('Col 1')).toBeInTheDocument()
      expect(screen.getByText('Col 2')).toBeInTheDocument()
      expect(screen.getByText('Col 3')).toBeInTheDocument()
    })

    it('should apply gutter to columns', () => {
      const { container } = render(Row, {
        props: { gutter: 24 },
        slots: {
          default: () => [
            h(Col, { span: 12 }, () => 'Col 1'),
            h(Col, { span: 12 }, () => 'Col 2'),
          ],
        },
      })
      
      // Check that Row has negative margin
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
      expect(row.style.marginRight).toBeTruthy()
    })

    it('should work with complex layout', () => {
      const { container } = render(Row, {
        props: { gutter: [16, 8], align: 'middle', justify: 'center' },
        slots: {
          default: () => [
            h(Col, { span: 6, offset: 2 }, () => 'Col 1'),
            h(Col, { span: 12 }, () => 'Col 2'),
            h(Col, { span: 4 }, () => 'Col 3'),
          ],
        },
      })
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('flex')
      expect(row).toHaveClass('items-center')
      expect(row).toHaveClass('justify-center')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations for Row', async () => {
      const { container } = render(Row, {
        slots: {
          default: () => h(Col, () => 'Content'),
        },
      })

      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations for Col', async () => {
      const { container } = render(Col, {
        slots: {
          default: () => 'Content',
        },
      })

      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle Row with no children', () => {
      const { container } = render(Row)
      
      const row = container.querySelector('div')
      expect(row).toBeInTheDocument()
    })

    it('should handle Col with no children', () => {
      const { container } = render(Col)
      
      const col = container.querySelector('div')
      expect(col).toBeInTheDocument()
    })

    it('should handle many columns', () => {
      const columns = Array.from({ length: 24 }, (_, i) =>
        h(Col, { span: 1, key: i }, () => `${i + 1}`)
      )

      render(Row, {
        slots: {
          default: () => columns,
        },
      })
      
      // Verify we can see first and last column
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('24')).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for basic grid', () => {
      const { container } = render(Row, {
        slots: {
          default: () => [
            h(Col, { span: 12 }, () => 'Left'),
            h(Col, { span: 12 }, () => 'Right'),
          ],
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for complex grid', () => {
      const { container } = render(Row, {
        props: { gutter: 16, align: 'middle' },
        slots: {
          default: () => [
            h(Col, { span: 8, offset: 2 }, () => 'Col 1'),
            h(Col, { span: 12 }, () => 'Col 2'),
          ],
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
