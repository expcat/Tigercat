/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React, { createRef } from 'react'
import { RESULT_ICON_SIZE_PX } from '@expcat/tigercat-core'
import { Result } from '@expcat/tigercat-react/Result'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Result (React)', () => {
  describe('Rendering', () => {
    it('does not use a live region by default', () => {
      const { container } = render(<Result status="success" title="Done" />)
      expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('lets the caller opt into a role', () => {
      render(<Result status="success" title="Done" role="status" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders title as a heading', () => {
      render(<Result title="Operation Complete" />)
      expect(
        screen.getByRole('heading', { name: 'Operation Complete', level: 2 })
      ).toBeInTheDocument()
    })

    it('honors headingLevel', () => {
      render(<Result title="Done" headingLevel={3} />)
      expect(screen.getByRole('heading', { name: 'Done', level: 3 })).toBeInTheDocument()
    })

    it('renders subTitle', () => {
      render(<Result title="Done" subTitle="Details here" />)
      expect(screen.getByText('Details here')).toBeInTheDocument()
    })

    it('renders icon area', () => {
      const { container } = render(<Result status="success" />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('forwards ref to the root', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Result ref={ref} title="Done" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Status variants', () => {
    it('renders error status', () => {
      render(<Result status="error" title="Failed" />)
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('renders warning status', () => {
      render(<Result status="warning" title="Warn" />)
      expect(screen.getByText('Warn')).toBeInTheDocument()
    })

    it('renders info status (default)', () => {
      render(<Result title="Info" />)
      expect(screen.getByText('Info')).toBeInTheDocument()
    })

    it('renders 404 digits and hides them when a title is present', () => {
      render(<Result status="404" title="Not Found" />)
      const digits = screen.getByText('404')
      expect(digits).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('heading', { name: 'Not Found' })).toBeInTheDocument()
    })

    it('keeps HTTP digits as the visible name when there is no title', () => {
      render(<Result status="404" />)
      const digits = screen.getByText('404')
      expect(digits).not.toHaveAttribute('aria-hidden')
    })

    it('does not throw on an unknown status', () => {
      expect(() => render(<Result status={'foo' as 'info'} title="Fallback" />)).not.toThrow()
      expect(screen.getByRole('heading', { name: 'Fallback' })).toBeInTheDocument()
    })

    it('renders the status gallery including success', () => {
      const statuses = ['success', 'info', 'warning', 'error', '404', '403', '500'] as const
      render(
        <>
          {statuses.map((status) => (
            <Result
              key={status}
              status={status}
              title={status.startsWith('4') || status === '500' ? undefined : status}
              subTitle="状态决定图标与配色"
            />
          ))}
        </>
      )
      expect(screen.getByRole('heading', { name: 'success' })).toBeInTheDocument()
      expect(screen.getByText('403')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })

  describe('Icon geometry', () => {
    it('keeps the icon container square', () => {
      const { container } = render(<Result status="404" />)
      const circle = container.querySelector('span')?.parentElement as HTMLElement
      expect(circle.style.width).toBe(`${RESULT_ICON_SIZE_PX}px`)
      expect(circle.style.height).toBe(circle.style.width)
    })
  })

  describe('Custom content', () => {
    it('renders custom icon node', () => {
      render(<Result title="Custom" icon={<span data-testid="custom-icon">★</span>} />)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders extra actions', () => {
      render(<Result title="T" extra={<button>Retry</button>} />)
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('renders children body', () => {
      render(
        <Result title="T">
          <div>Body content</div>
        </Result>
      )
      expect(screen.getByText('Body content')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('merges className prop', () => {
      const { container } = render(<Result className="my-result" />)
      expect(container.firstElementChild).toHaveClass('my-result')
    })
  })

  describe('Accessibility', () => {
    it('hides the default status SVG', () => {
      const { container } = render(<Result status="success" title="Done" />)
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have no accessibility violations for titled, empty, and a gallery', async () => {
      const { container, rerender } = render(<Result status="success" title="提交成功" />)
      await expectNoA11yViolationsIsolated(container)

      rerender(<Result />)
      await expectNoA11yViolationsIsolated(container)

      rerender(
        <div>
          <Result status="success" title="A" />
          <Result status="error" title="B" />
          <Result status="404" />
        </div>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
