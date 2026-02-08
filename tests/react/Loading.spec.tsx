import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { Loading } from '../../packages/react/src/components/Loading'

describe('Loading (React)', () => {
  it('renders with a11y defaults', () => {
    render(<Loading />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'Loading')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-busy', 'true')
  })

  it('renders text and uses it as aria-label', () => {
    render(<Loading text="Loading data" />)
    expect(screen.getByText('Loading data')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data')
  })

  it('forwards attributes and merges className', () => {
    render(<Loading className="custom-class" data-testid="loading" />)
    const status = screen.getByTestId('loading')
    expect(status).toHaveClass('custom-class')
  })

  it('renders dots and bars variants', () => {
    const { container: dotsContainer } = render(<Loading variant="dots" />)
    expect(dotsContainer.querySelectorAll('.animate-bounce-dot')).toHaveLength(3)

    const { container: barsContainer } = render(<Loading variant="bars" />)
    expect(barsContainer.querySelectorAll('.animate-scale-bar')).toHaveLength(3)
  })

  it('renders ring and pulse variants as SVG', () => {
    const { container: ringContainer } = render(<Loading variant="ring" />)
    expect(ringContainer.querySelector('svg')).toBeInTheDocument()
    expect(ringContainer.querySelector('svg')).toHaveClass('animate-spin')

    const { container: pulseContainer } = render(<Loading variant="pulse" />)
    expect(pulseContainer.querySelector('svg')).toBeInTheDocument()
    expect(pulseContainer.querySelector('svg')).toHaveClass('animate-pulse')
  })

  it('applies size classes', () => {
    const { container: smContainer } = render(<Loading size="sm" />)
    expect(smContainer.querySelector('svg')).toHaveClass('h-4', 'w-4')

    const { container: xlContainer } = render(<Loading size="xl" />)
    expect(xlContainer.querySelector('svg')).toHaveClass('h-16', 'w-16')
  })

  it('applies color classes', () => {
    const { container } = render(<Loading color="success" />)
    const svg = container.querySelector('svg')
    expect(svg?.className).toContain('--tiger-success')
  })

  it('applies customColor as inline style', () => {
    const { container } = render(<Loading customColor="#ff0000" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ color: '#ff0000' })
  })

  it('supports fullscreen background', () => {
    const { container } = render(<Loading fullscreen background="rgba(0, 0, 0, 0.8)" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
  })

  it('respects delay', async () => {
    vi.useFakeTimers()

    render(<Loading delay={100} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
