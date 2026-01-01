import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Loading } from '../../packages/react/src/components/Loading'

describe('Loading (React)', () => {
  describe('Rendering', () => {
    it('renders loading component', () => {
      render(<Loading />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders with default variant (spinner)', () => {
      const { container } = render(<Loading />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('animate-spin')
    })

    it('renders with text', () => {
      render(<Loading text="Loading..." />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('has correct aria attributes', () => {
      render(<Loading text="Loading data" />)
      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-label', 'Loading data')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('uses default aria-label when no text provided', () => {
      render(<Loading />)
      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-label', 'Loading')
    })
  })

  describe('Variants', () => {
    it('renders spinner variant', () => {
      const { container } = render(<Loading variant="spinner" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('animate-spin')
    })

    it('renders ring variant', () => {
      const { container } = render(<Loading variant="ring" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('animate-spin')
    })

    it('renders dots variant', () => {
      const { container } = render(<Loading variant="dots" />)
      const dots = container.querySelectorAll('.animate-bounce-dot')
      expect(dots.length).toBe(3)
    })

    it('renders bars variant', () => {
      const { container } = render(<Loading variant="bars" />)
      const bars = container.querySelectorAll('.animate-scale-bar')
      expect(bars.length).toBe(3)
    })

    it('renders pulse variant', () => {
      const { container } = render(<Loading variant="pulse" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('animate-pulse')
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Loading size="sm" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-4')
      expect(svg).toHaveClass('w-4')
    })

    it('renders medium size (default)', () => {
      const { container } = render(<Loading size="md" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-6')
      expect(svg).toHaveClass('w-6')
    })

    it('renders large size', () => {
      const { container } = render(<Loading size="lg" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-10')
      expect(svg).toHaveClass('w-10')
    })

    it('renders extra large size', () => {
      const { container } = render(<Loading size="xl" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-16')
      expect(svg).toHaveClass('w-16')
    })

    it('applies correct text size', () => {
      render(<Loading text="Loading..." size="sm" />)
      const text = screen.getByText('Loading...')
      expect(text).toHaveClass('text-xs')
    })
  })

  describe('Colors', () => {
    it('renders with primary color (default)', () => {
      const { container } = render(<Loading color="primary" />)
      const svg = container.querySelector('svg')
      expect(svg?.className).toContain('text-')
    })

    it('renders with secondary color', () => {
      const { container } = render(<Loading color="secondary" />)
      const svg = container.querySelector('svg')
      expect(svg?.className).toContain('text-')
    })

    it('renders with success color', () => {
      const { container } = render(<Loading color="success" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('text-green-600')
    })

    it('renders with warning color', () => {
      const { container } = render(<Loading color="warning" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('text-yellow-600')
    })

    it('renders with danger color', () => {
      const { container } = render(<Loading color="danger" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('text-red-600')
    })

    it('renders with custom color', () => {
      const { container } = render(<Loading customColor="#ff6b6b" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveStyle({ color: '#ff6b6b' })
    })
  })

  describe('Fullscreen Mode', () => {
    it('renders in fullscreen mode', () => {
      const { container } = render(<Loading fullscreen />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('fixed')
      expect(wrapper).toHaveClass('inset-0')
      expect(wrapper).toHaveClass('z-50')
    })

    it('applies custom background in fullscreen mode', () => {
      const { container } = render(
        <Loading fullscreen background="rgba(0, 0, 0, 0.8)" />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
    })

    it('does not apply background when not fullscreen', () => {
      const { container } = render(
        <Loading fullscreen={false} background="rgba(0, 0, 0, 0.8)" />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).not.toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
    })
  })

  describe('Delay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows immediately when delay is 0', () => {
      render(<Loading delay={0} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('does not show initially when delay is set', () => {
      render(<Loading delay={300} />)
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // This test uses real timers to properly test React state updates
    it('shows after delay time has passed', async () => {
      vi.useRealTimers() // Use real timers for this test
      
      const { container } = render(<Loading delay={100} />)
      
      // Initially not visible
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      
      // Wait for delay to pass
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      }, { timeout: 200 })
      
      vi.useFakeTimers() // Restore fake timers for other tests
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Loading className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })

    it('combines custom className with base classes', () => {
      const { container } = render(<Loading className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('inline-flex')
      expect(wrapper).toHaveClass('custom-class')
    })

    it('passes additional props to wrapper', () => {
      const { container } = render(<Loading data-testid="custom-loading" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveAttribute('data-testid', 'custom-loading')
    })
  })

  describe('Animation Styles', () => {
    it('injects animation styles into document', () => {
      render(<Loading />)
      const styleElement = document.getElementById('tiger-loading-animations')
      expect(styleElement).toBeInTheDocument()
      expect(styleElement?.textContent).toContain('@keyframes bounce-dot')
      expect(styleElement?.textContent).toContain('@keyframes scale-bar')
    })

    it('does not inject duplicate styles', () => {
      render(<Loading />)
      render(<Loading />)
      const styles = document.querySelectorAll('#tiger-loading-animations')
      expect(styles.length).toBe(1)
    })
  })

  describe('Dots Variant Animation', () => {
    it('applies different delays to each dot', () => {
      const { container } = render(<Loading variant="dots" />)
      const dots = container.querySelectorAll('.animate-bounce-dot')
      
      expect(dots[0]).toHaveClass('animation-delay-0')
      expect(dots[1]).toHaveClass('animation-delay-150')
      expect(dots[2]).toHaveClass('animation-delay-300')
    })
  })

  describe('Bars Variant Animation', () => {
    it('applies different delays to each bar', () => {
      const { container } = render(<Loading variant="bars" />)
      const bars = container.querySelectorAll('.animate-scale-bar')
      
      expect(bars[0]).toHaveClass('animation-delay-0')
      expect(bars[1]).toHaveClass('animation-delay-150')
      expect(bars[2]).toHaveClass('animation-delay-300')
    })
  })
})
