/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@tigercat/react'

describe('Pagination', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Pagination total={100} />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveAttribute('aria-label', '分页导航')
    })

    it('should render page numbers correctly', () => {
      render(<Pagination total={100} pageSize={10} />)

      // Should show first, current (1), and last page (10)
      expect(screen.getByLabelText('第 1 页')).toBeInTheDocument()
      expect(screen.getByLabelText('第 10 页')).toBeInTheDocument()
    })

    it('should render with total text', () => {
      render(<Pagination total={100} pageSize={10} />)

      expect(screen.getByText('共 100 条')).toBeInTheDocument()
    })

    it('should hide total text when showTotal is false', () => {
      render(<Pagination total={100} pageSize={10} showTotal={false} />)

      expect(screen.queryByText('共 100 条')).not.toBeInTheDocument()
    })

    it('should render custom total text', () => {
      const totalText = (total: number, range: [number, number]) => {
        return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
      }

      render(<Pagination total={100} pageSize={10} totalText={totalText} />)

      expect(screen.getByText('显示 1-10 条，共 100 条')).toBeInTheDocument()
    })
  })

  describe('Simple Mode', () => {
    it('should render in simple mode', () => {
      render(<Pagination total={100} pageSize={10} simple />)

      // Should show current/total text
      expect(screen.getByText(/1 \/ 10/)).toBeInTheDocument()
    })

    it('should not render page numbers in simple mode', () => {
      render(<Pagination total={100} pageSize={10} simple />)

      // Should not have page number buttons
      expect(screen.queryByLabelText('第 2 页')).not.toBeInTheDocument()
    })
  })

  describe('Page Navigation', () => {
    it('should call onChange when page is clicked', async () => {
      const onChange = vi.fn()
      render(<Pagination total={100} pageSize={10} onChange={onChange} />)

      const page2Button = screen.getByLabelText('第 2 页')
      await fireEvent.click(page2Button)

      expect(onChange).toHaveBeenCalledWith(2, 10)
    })

    it('should navigate to previous page', async () => {
      const onChange = vi.fn()
      render(<Pagination total={100} pageSize={10} current={5} onChange={onChange} />)

      const prevButton = screen.getByLabelText('上一页')
      await fireEvent.click(prevButton)

      expect(onChange).toHaveBeenCalledWith(4, 10)
    })

    it('should navigate to next page', async () => {
      const onChange = vi.fn()
      render(<Pagination total={100} pageSize={10} current={5} onChange={onChange} />)

      const nextButton = screen.getByLabelText('下一页')
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(6, 10)
    })

    it('should disable prev button on first page', () => {
      render(<Pagination total={100} pageSize={10} current={1} />)

      const prevButton = screen.getByLabelText('上一页')
      expect(prevButton).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      render(<Pagination total={100} pageSize={10} current={10} />)

      const nextButton = screen.getByLabelText('下一页')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Quick Jumper', () => {
    it('should show quick jumper when showQuickJumper is true', () => {
      render(<Pagination total={100} pageSize={10} showQuickJumper />)

      expect(screen.getByText('跳至')).toBeInTheDocument()
      expect(screen.getByText('页')).toBeInTheDocument()
      expect(screen.getByLabelText('跳转页码')).toBeInTheDocument()
    })

    it('should jump to page when enter is pressed', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Pagination total={100} pageSize={10} showQuickJumper onChange={onChange} />)

      const input = screen.getByLabelText('跳转页码')
      await user.type(input, '5')
      await user.keyboard('{Enter}')

      expect(onChange).toHaveBeenCalledWith(5, 10)
    })

    it('should clear input after jumping', async () => {
      const user = userEvent.setup()
      render(<Pagination total={100} pageSize={10} showQuickJumper />)

      const input = screen.getByLabelText('跳转页码') as HTMLInputElement
      await user.type(input, '5')
      await user.keyboard('{Enter}')

      expect(input.value).toBe('')
    })
  })

  describe('Page Size Changer', () => {
    it('should show size changer when showSizeChanger is true', () => {
      render(<Pagination total={100} pageSize={10} showSizeChanger />)

      expect(screen.getByLabelText('每页条数')).toBeInTheDocument()
    })

    it('should call onPageSizeChange when page size is changed', async () => {
      const onPageSizeChange = vi.fn()
      render(
        <Pagination 
          total={100} 
          pageSize={10} 
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={onPageSizeChange}
        />
      )

      const select = screen.getByLabelText('每页条数')
      await fireEvent.change(select, { target: { value: '20' } })

      expect(onPageSizeChange).toHaveBeenCalledWith(1, 20)
    })

    it('should adjust current page when page size increases and exceeds total pages', async () => {
      const onPageSizeChange = vi.fn()
      render(
        <Pagination 
          total={100} 
          pageSize={10}
          current={10} // Last page with pageSize=10
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={onPageSizeChange}
        />
      )

      const select = screen.getByLabelText('每页条数')
      await fireEvent.change(select, { target: { value: '50' } })

      // With pageSize=50, there are only 2 pages, so current should be adjusted to 2
      expect(onPageSizeChange).toHaveBeenCalledWith(2, 50)
    })
  })

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<Pagination total={100} pageSize={10} size="small" />)

      const button = container.querySelector('button')
      expect(button).toHaveClass('h-7')
    })

    it('should render medium size', () => {
      const { container } = render(<Pagination total={100} pageSize={10} size="medium" />)

      const button = container.querySelector('button')
      expect(button).toHaveClass('h-8')
    })

    it('should render large size', () => {
      const { container } = render(<Pagination total={100} pageSize={10} size="large" />)

      const button = container.querySelector('button')
      expect(button).toHaveClass('h-10')
    })
  })

  describe('Alignment', () => {
    it('should align left', () => {
      const { container } = render(<Pagination total={100} pageSize={10} align="left" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('justify-start')
    })

    it('should align center', () => {
      const { container } = render(<Pagination total={100} pageSize={10} align="center" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('justify-center')
    })

    it('should align right', () => {
      const { container } = render(<Pagination total={100} pageSize={10} align="right" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('justify-end')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Pagination total={100} pageSize={10} disabled />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('should hide when only one page and hideOnSinglePage is true', () => {
      const { container } = render(<Pagination total={5} pageSize={10} hideOnSinglePage />)

      expect(container.querySelector('nav')).not.toBeInTheDocument()
    })

    it('should show when more than one page even if hideOnSinglePage is true', () => {
      const { container } = render(<Pagination total={50} pageSize={10} hideOnSinglePage />)

      expect(container.querySelector('nav')).toBeInTheDocument()
    })
  })

  describe('Active Page', () => {
    it('should highlight current page', () => {
      render(<Pagination total={100} pageSize={10} current={3} />)

      const page3Button = screen.getByLabelText('第 3 页')
      expect(page3Button).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Page Number Range', () => {
    it('should show ellipsis for large page counts', () => {
      render(<Pagination total={1000} pageSize={10} current={50} />)

      // Should have ellipsis
      const ellipsis = screen.getAllByText('...')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('should show less items when showLessItems is true', () => {
      const { container: container1 } = render(
        <Pagination total={1000} pageSize={10} current={50} showLessItems={false} />
      )

      const { container: container2 } = render(
        <Pagination total={1000} pageSize={10} current={50} showLessItems />
      )

      const buttons1 = container1.querySelectorAll('button')
      const buttons2 = container2.querySelectorAll('button')

      // showLessItems should result in fewer buttons
      expect(buttons2.length).toBeLessThan(buttons1.length)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<Pagination total={100} pageSize={10} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('role', 'navigation')
      expect(nav).toHaveAttribute('aria-label', '分页导航')
    })

    it('should have aria-current on active page', () => {
      render(<Pagination total={100} pageSize={10} current={5} />)

      const page5Button = screen.getByLabelText('第 5 页')
      expect(page5Button).toHaveAttribute('aria-current', 'page')
    })

    it('should have aria-label on buttons', () => {
      render(<Pagination total={100} pageSize={10} />)

      expect(screen.getByLabelText('上一页')).toBeInTheDocument()
      expect(screen.getByLabelText('下一页')).toBeInTheDocument()
      expect(screen.getByLabelText('第 1 页')).toBeInTheDocument()
    })

    it('should have aria-hidden on ellipsis', () => {
      const { container } = render(<Pagination total={1000} pageSize={10} current={50} />)

      const ellipsis = container.querySelector('[aria-hidden="true"]')
      expect(ellipsis).toBeInTheDocument()
    })
  })

  describe('Custom Class and Style', () => {
    it('should apply custom className', () => {
      const { container } = render(<Pagination total={100} pageSize={10} className="custom-class" />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-class')
    })

    it('should apply custom style', () => {
      const { container } = render(<Pagination total={100} pageSize={10} style={{ marginTop: '20px' }} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveStyle({ marginTop: '20px' })
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('should work in controlled mode', async () => {
      const onChange = vi.fn()
      const { rerender } = render(<Pagination total={100} pageSize={10} current={1} onChange={onChange} />)

      const page2Button = screen.getByLabelText('第 2 页')
      await fireEvent.click(page2Button)

      expect(onChange).toHaveBeenCalledWith(2, 10)

      // In controlled mode, parent must update current prop
      rerender(<Pagination total={100} pageSize={10} current={2} onChange={onChange} />)

      const page2ButtonAfter = screen.getByLabelText('第 2 页')
      expect(page2ButtonAfter).toHaveAttribute('aria-current', 'page')
    })

    it('should work in uncontrolled mode', async () => {
      const onChange = vi.fn()
      render(<Pagination total={100} pageSize={10} defaultCurrent={1} onChange={onChange} />)

      const page2Button = screen.getByLabelText('第 2 页')
      await fireEvent.click(page2Button)

      expect(onChange).toHaveBeenCalledWith(2, 10)

      // In uncontrolled mode, component manages its own state
      const page2ButtonAfter = screen.getByLabelText('第 2 页')
      expect(page2ButtonAfter).toHaveAttribute('aria-current', 'page')
    })
  })
})
