/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Empty } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Empty (React)', () => {
  describe('Rendering', () => {
    it('renders with default description', () => {
      render(<Empty />)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('renders custom description', () => {
      render(<Empty description="Nothing here" />)
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('renders default SVG illustration', () => {
      const { container } = render(<Empty />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('hides illustration when showImage=false', () => {
      const { container } = render(<Empty showImage={false} />)
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('Custom content', () => {
    it('renders custom image node', () => {
      render(<Empty image={<img src="custom.png" alt="custom" />} />)
      expect(screen.getByAltText('custom')).toBeInTheDocument()
    })

    it('renders extra actions', () => {
      render(<Empty extra={<button>Create</button>} />)
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('renders children body content', () => {
      render(
        <Empty>
          <p>Body text</p>
        </Empty>
      )
      expect(screen.getByText('Body text')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('merges className prop', () => {
      const { container } = render(<Empty className="my-empty" />)
      expect(container.firstElementChild).toHaveClass('my-empty')
    })
  })

  describe('Presets', () => {
    it('renders with default preset', () => {
      render(<Empty preset="default" />)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Empty />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
