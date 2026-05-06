/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Empty } from '@expcat/tigercat-react'

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
      render(<Empty><p>Body text</p></Empty>)
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
})
