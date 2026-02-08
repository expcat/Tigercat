/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Card } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Card', () => {
  it('renders children and merges className', () => {
    const { container } = render(<Card className="custom-class">Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders header/footer/actions', () => {
    render(
      <Card header="Header" footer="Footer" actions={<button>Action</button>}>
        Body
      </Card>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const variants = [
      { variant: 'default' as const, expected: 'border ' },
      { variant: 'bordered' as const, expected: 'border-2' },
      { variant: 'shadow' as const, expected: 'shadow-md' },
      { variant: 'elevated' as const, expected: 'shadow-lg' }
    ]

    for (const { variant, expected } of variants) {
      const { container, unmount } = render(<Card variant={variant}>body</Card>)
      expect(container.firstElementChild?.className).toContain(expected)
      unmount()
    }
  })

  it('applies size classes', () => {
    const sizes = [
      { size: 'sm' as const, expected: 'p-3' },
      { size: 'md' as const, expected: 'p-4' },
      { size: 'lg' as const, expected: 'p-6' }
    ]

    for (const { size, expected } of sizes) {
      const { container, unmount } = render(<Card size={size}>body</Card>)
      expect(container.firstElementChild?.className).toContain(expected)
      unmount()
    }
  })

  it('supports hoverable and native attributes passthrough', () => {
    const { container } = render(
      <Card hoverable id="card-id" data-testid="card">
        Content
      </Card>
    )

    expect(container.querySelector('#card-id')).toBeInTheDocument()
    const card = screen.getByTestId('card')
    expect(card.className).toContain('cursor-pointer')
  })

  it('renders cover image with default and custom alt', () => {
    const { rerender, container } = render(<Card cover="https://example.com/image.jpg">Body</Card>)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'Card cover image')

    rerender(
      <Card cover="https://example.com/image.jpg" coverAlt="Custom alt">
        Body
      </Card>
    )
    expect(container.querySelector('img')).toHaveAttribute('alt', 'Custom alt')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Card>Accessible Card</Card>)
      await expectNoA11yViolations(container)
    })
  })
})
