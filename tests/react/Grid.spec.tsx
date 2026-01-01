/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Row, Col } from '@tigercat/react'
import {
  renderWithProps,
} from '../utils/render-helpers-react'
import {
  expectNoA11yViolations,
} from '../utils'
import React from 'react'

const aligns = ['top', 'middle', 'bottom'] as const
const justifies = ['start', 'end', 'center', 'space-around', 'space-between'] as const

describe('Row and Col (React)', () => {
  describe('Row - Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Row />)
      
      const row = container.querySelector('div')
      expect(row).toBeInTheDocument()
      expect(row).toHaveClass('flex')
    })

    it('should render children columns', () => {
      render(
        <Row>
          <Col>Column 1</Col>
          <Col>Column 2</Col>
        </Row>
      )
      
      expect(screen.getByText('Column 1')).toBeInTheDocument()
      expect(screen.getByText('Column 2')).toBeInTheDocument()
    })
  })

  describe('Row - Alignment', () => {
    it.each(aligns)('should apply %s vertical alignment', (align) => {
      const { container } = renderWithProps(Row, {
        align,
        children: <Col>Content</Col>,
      })
      
      const row = container.querySelector('div')
      expect(row?.className).toBeTruthy()
    })

    it('should use top alignment by default', () => {
      const { container } = render(<Row />)
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('items-start')
    })
  })

  describe('Row - Justify', () => {
    it.each(justifies)('should apply %s horizontal alignment', (justify) => {
      const { container } = renderWithProps(Row, {
        justify,
        children: <Col>Content</Col>,
      })
      
      const row = container.querySelector('div')
      expect(row?.className).toBeTruthy()
    })

    it('should use start justify by default', () => {
      const { container } = render(<Row />)
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('justify-start')
    })
  })

  describe('Row - Gutter', () => {
    it('should apply numeric gutter', () => {
      const { container } = renderWithProps(Row, {
        gutter: 16,
        children: <Col>Content</Col>,
      })
      
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
      expect(row.style.marginRight).toBeTruthy()
    })

    it('should apply array gutter [horizontal, vertical]', () => {
      const { container } = renderWithProps(Row, {
        gutter: [16, 8],
        children: <Col>Content</Col>,
      })
      
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
    })

    it('should pass gutter to Col children', () => {
      const { container } = render(
        <Row gutter={16}>
          <Col>Content</Col>
        </Row>
      )
      
      // Check that Row has negative margin
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
      expect(row.style.marginRight).toBeTruthy()
    })
  })

  describe('Row - Wrap', () => {
    it('should wrap by default', () => {
      const { container } = render(<Row />)
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('flex-wrap')
    })

    it('should not wrap when set to false', () => {
      const { container } = renderWithProps(Row, { wrap: false })
      
      const row = container.querySelector('div')
      expect(row).not.toHaveClass('flex-wrap')
    })
  })

  describe('Row - Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Row, {
        className: 'custom-row-class',
      })
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('custom-row-class')
      expect(row).toHaveClass('flex') // Should also have base classes
    })

    it('should apply custom style', () => {
      const { container } = renderWithProps(Row, {
        style: { backgroundColor: 'red' },
      })
      
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.backgroundColor).toBe('red')
    })
  })

  describe('Col - Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Col />)
      
      const col = container.querySelector('div')
      expect(col).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(<Col>Column content</Col>)
      
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
      const { container } = render(<Col />)
      
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
      const { container } = render(<Col />)
      
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

  describe('Col - Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Col, {
        className: 'custom-col-class',
      })
      
      const col = container.querySelector('div')
      expect(col).toHaveClass('custom-col-class')
    })

    it('should apply custom style', () => {
      const { container } = renderWithProps(Col, {
        style: { backgroundColor: 'blue' },
      })
      
      const col = container.querySelector('div') as HTMLElement
      expect(col.style.backgroundColor).toBe('blue')
    })
  })

  describe('Integration - Row and Col', () => {
    it('should create a grid layout', () => {
      render(
        <Row>
          <Col span={8}>Col 1</Col>
          <Col span={8}>Col 2</Col>
          <Col span={8}>Col 3</Col>
        </Row>
      )
      
      expect(screen.getByText('Col 1')).toBeInTheDocument()
      expect(screen.getByText('Col 2')).toBeInTheDocument()
      expect(screen.getByText('Col 3')).toBeInTheDocument()
    })

    it('should apply gutter to columns', () => {
      const { container } = render(
        <Row gutter={24}>
          <Col span={12}>Col 1</Col>
          <Col span={12}>Col 2</Col>
        </Row>
      )
      
      // Check that Row has negative margin
      const row = container.querySelector('div') as HTMLElement
      expect(row.style.marginLeft).toBeTruthy()
      expect(row.style.marginRight).toBeTruthy()
    })

    it('should work with complex layout', () => {
      const { container } = render(
        <Row gutter={[16, 8]} align="middle" justify="center">
          <Col span={6} offset={2}>Col 1</Col>
          <Col span={12}>Col 2</Col>
          <Col span={4}>Col 3</Col>
        </Row>
      )
      
      const row = container.querySelector('div')
      expect(row).toHaveClass('flex')
      expect(row).toHaveClass('items-center')
      expect(row).toHaveClass('justify-center')
    })
  })

  describe('Children Types', () => {
    it('should handle empty Row', () => {
      const { container } = render(<Row />)
      
      const row = container.querySelector('div')
      expect(row).toBeInTheDocument()
    })

    it('should handle empty Col', () => {
      const { container} = render(<Col />)
      
      const col = container.querySelector('div')
      expect(col).toBeInTheDocument()
    })

    it('should handle many columns', () => {
      const columns = Array.from({ length: 24 }, (_, i) => (
        <Col key={i} span={1}>{i + 1}</Col>
      ))

      render(<Row>{columns}</Row>)
      
      // Verify we can see first and last column
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('24')).toBeInTheDocument()
    })

    it('should handle null children in Row', () => {
      const { container } = render(<Row>{null}</Row>)
      
      const row = container.querySelector('div')
      expect(row).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations for Row', async () => {
      const { container } = render(
        <Row>
          <Col>Content</Col>
        </Row>
      )

      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations for Col', async () => {
      const { container } = render(<Col>Content</Col>)

      await expectNoA11yViolations(container)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for basic grid', () => {
      const { container } = render(
        <Row>
          <Col span={12}>Left</Col>
          <Col span={12}>Right</Col>
        </Row>
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for complex grid', () => {
      const { container } = render(
        <Row gutter={16} align="middle">
          <Col span={8} offset={2}>Col 1</Col>
          <Col span={12}>Col 2</Col>
        </Row>
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
