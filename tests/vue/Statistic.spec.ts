/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Statistic } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

function createFrameScheduler() {
  let nextFrame = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const frame = nextFrame++
    callbacks.set(frame, callback)
    return frame
  })

  return {
    requestAnimationFrame,
    flush(timestamp: number, frame = [...callbacks.keys()][0]) {
      const callback = callbacks.get(frame)
      callbacks.delete(frame)
      callback?.(timestamp)
    }
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Statistic', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    renderWithProps(Statistic, { title: 'Users', value: 1000 })
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  it('renders string value', () => {
    renderWithProps(Statistic, { title: 'Status', value: 'Active' })
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(Statistic, { title: 'T', value: 1, className: 'my-stat' })
    const root = container.querySelector('.my-stat')
    expect(root).toBeInTheDocument()
    // className must merge with base classes, not replace them
    expect(root?.className).toContain('inline-block')
  })

  it('passes through fallthrough attrs to the root element', () => {
    const { container } = render(Statistic, {
      props: { title: 'T', value: 1 },
      attrs: { id: 'stat-1', 'data-testid': 'stat' }
    })
    const root = container.querySelector('#stat-1')
    expect(root).toBeInTheDocument()
    expect(root?.getAttribute('data-testid')).toBe('stat')
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    renderWithProps(Statistic, { title: 'T', value: 1, size })
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  // --- Precision ---
  it('formats value with precision', () => {
    renderWithProps(Statistic, { title: 'T', value: 123.4, precision: 2 })
    expect(screen.getByText('123.40')).toBeInTheDocument()
  })

  // --- Group separator ---
  it('formats value with group separator enabled', () => {
    renderWithProps(Statistic, { title: 'T', value: 1234567, groupSeparator: true })
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('formats value without separator when disabled', () => {
    renderWithProps(Statistic, { title: 'T', value: 1234567, groupSeparator: false })
    expect(screen.getByText('1234567')).toBeInTheDocument()
  })

  // --- Prefix / Suffix ---
  it('renders prefix', () => {
    renderWithProps(Statistic, { title: 'T', value: 100, prefix: '$' })
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders suffix', () => {
    renderWithProps(Statistic, { title: 'T', value: 100, suffix: '%' })
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders both prefix and suffix', () => {
    renderWithProps(Statistic, { title: 'Price', value: 99, prefix: '$', suffix: 'USD' })
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  // --- Animation ---
  it('supports animated numeric values', async () => {
    const scheduler = createFrameScheduler()
    vi.stubGlobal('requestAnimationFrame', scheduler.requestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    renderWithProps(Statistic, {
      title: 'Animated',
      value: 100,
      animated: true,
      animationDuration: 100
    })

    expect(scheduler.requestAnimationFrame).toHaveBeenCalled()
    scheduler.flush(0)
    scheduler.flush(100)
    expect(await screen.findByText('100')).toBeInTheDocument()
  })

  it('does not animate string values', () => {
    const requestAnimationFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame)

    renderWithProps(Statistic, { title: 'Status', value: 'Active', animated: true })

    expect(requestAnimationFrame).not.toHaveBeenCalled()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Statistic)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  it('formats zero value with precision', () => {
    renderWithProps(Statistic, { title: 'T', value: 0, precision: 2 })
    expect(screen.getByText('0.00')).toBeInTheDocument()
  })

  it('formats negative number', () => {
    renderWithProps(Statistic, { title: 'T', value: -42 })
    expect(screen.getByText('-42')).toBeInTheDocument()
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(Statistic)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
