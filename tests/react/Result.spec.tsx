/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Result } from '@expcat/tigercat-react'

describe('Result (React)', () => {
  describe('Rendering', () => {
    it('renders with role=status', () => {
      render(<Result status="success" title="Done" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<Result title="Operation Complete" />)
      expect(screen.getByText('Operation Complete')).toBeInTheDocument()
    })

    it('renders subTitle', () => {
      render(<Result title="Done" subTitle="Details here" />)
      expect(screen.getByText('Details here')).toBeInTheDocument()
    })

    it('renders icon area', () => {
      const { container } = render(<Result status="success" />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Status variants', () => {
    it('renders success status', () => {
      render(<Result status="success" title="OK" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

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

    it('renders 404 status with HTTP label', () => {
      render(<Result status="404" title="Not Found" />)
      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Not Found')).toBeInTheDocument()
    })

    it('renders 403 status', () => {
      render(<Result status="403" title="Forbidden" />)
      expect(screen.getByText('403')).toBeInTheDocument()
    })

    it('renders 500 status', () => {
      render(<Result status="500" title="Server Error" />)
      expect(screen.getByText('500')).toBeInTheDocument()
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
      render(<Result title="T"><div>Body content</div></Result>)
      expect(screen.getByText('Body content')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('merges className prop', () => {
      const { container } = render(<Result className="my-result" />)
      expect(container.firstElementChild).toHaveClass('my-result')
    })
  })
})
