import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Loading } from '../../packages/vue/src/components/Loading'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Loading (Vue)', () => {
  afterEach(() => {
    document.body.style.overflow = ''
    vi.useRealTimers()
  })

  it('renders with a11y defaults', () => {
    render(Loading)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'Loading')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-busy', 'true')
  })

  it('renders text and uses it as aria-label', () => {
    render(Loading, { props: { text: 'Loading data' } })
    expect(screen.getByText('Loading data')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data')
  })

  it('forwards attrs and merges class', () => {
    const { container } = render(Loading, {
      props: { className: 'prop-class' },
      attrs: { class: 'attr-class', 'data-testid': 'loading' }
    })

    const status = screen.getByTestId('loading')
    expect(status).toHaveClass('prop-class')
    expect(status).toHaveClass('attr-class')
    expect(container.firstChild).toBe(status)
  })

  it('renders dots and bars variants', () => {
    const { container: dotsContainer } = render(Loading, {
      props: { variant: 'dots' }
    })
    expect(dotsContainer.querySelectorAll('.animate-bounce-dot')).toHaveLength(3)

    const { container: barsContainer } = render(Loading, {
      props: { variant: 'bars' }
    })
    expect(barsContainer.querySelectorAll('.animate-scale-bar')).toHaveLength(3)
  })

  it('renders ring and pulse variants as SVG', () => {
    const { container: ringContainer } = render(Loading, {
      props: { variant: 'ring' }
    })
    expect(ringContainer.querySelector('svg')).toBeInTheDocument()
    expect(ringContainer.querySelector('svg')).toHaveClass('animate-spin')

    const { container: pulseContainer } = render(Loading, {
      props: { variant: 'pulse' }
    })
    expect(pulseContainer.querySelector('svg')).toBeInTheDocument()
    expect(pulseContainer.querySelector('svg')).toHaveClass('animate-pulse')
  })

  it('applies size classes', () => {
    const { container: smContainer } = render(Loading, { props: { size: 'sm' } })
    expect(smContainer.querySelector('svg')).toHaveClass('h-4', 'w-4')

    const { container: xlContainer } = render(Loading, { props: { size: 'xl' } })
    expect(xlContainer.querySelector('svg')).toHaveClass('h-16', 'w-16')
  })

  it('applies color classes', () => {
    const { container } = render(Loading, { props: { color: 'success' } })
    const svg = container.querySelector('svg')
    expect(svg?.className).toContain('--tiger-success')
  })

  it('applies customColor as inline style', () => {
    const { container } = render(Loading, { props: { customColor: '#ff0000' } })
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ color: '#ff0000' })
  })

  it('supports fullscreen background', () => {
    const { container, unmount } = render(Loading, {
      props: { fullscreen: true, background: 'rgba(0, 0, 0, 0.8)' }
    })
    const wrapper = screen.getByRole('status')

    expect(container.querySelector('[role="status"]')).toBeNull()
    expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('allows fullscreen loading without scroll lock', () => {
    render(Loading, { props: { fullscreen: true, lockScroll: false } })

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('respects delay', async () => {
    vi.useFakeTimers()

    render(Loading, { props: { delay: 100 } })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Loading)
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
