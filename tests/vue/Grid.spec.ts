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

  import { describe, it, expect } from 'vitest'
  import { render, screen } from '@testing-library/vue'
  import { h } from 'vue'
  import { Row, Col } from '@tigercat/vue'
  import { expectNoA11yViolations } from '../utils'

  describe('Grid (Vue)', () => {
    it('renders Row defaults and forwards attrs', () => {
      render(Row, { attrs: { 'data-testid': 'row' } })

      const row = screen.getByTestId('row')
      expect(row).toHaveClass('flex', 'flex-wrap', 'items-start', 'justify-start')
    })

    it('applies align/justify classes', () => {
      render(Row, {
        props: { align: 'middle', justify: 'center' },
        attrs: { 'data-testid': 'row' },
      })

      const row = screen.getByTestId('row')
      expect(row).toHaveClass('items-center', 'justify-center')
    })

    it('applies gutter styles to Row and Col', () => {
      render(Row, {
        props: { gutter: 16 },
        attrs: { 'data-testid': 'row' },
        slots: {
          default: () => h(Col, { 'data-testid': 'col' }, () => 'Content'),
        },
      })

      const row = screen.getByTestId('row') as HTMLElement
      const col = screen.getByTestId('col') as HTMLElement

      expect(row.style.marginLeft).toBe('-8px')
      expect(row.style.marginRight).toBe('-8px')
      expect(col.style.paddingLeft).toBe('8px')
      expect(col.style.paddingRight).toBe('8px')
    })

    it('applies span/offset classes', () => {
      render(Col, { props: { span: 12, offset: 4 }, attrs: { 'data-testid': 'col' } })

      const col = screen.getByTestId('col')
      expect(col.className).toContain('w-[50%]')
      expect(col.className).toContain('ml-[16.666667%]')
    })

    it('has no a11y violations for a basic grid', async () => {
      const { container } = render(Row, {
        slots: {
          default: () => h(Col, () => 'Content'),
        },
      })

      await expectNoA11yViolations(container)
    })
  })
      // Check that Row has negative margin
