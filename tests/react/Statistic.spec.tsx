/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { Statistic } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
  it('renders string value', () => {
    render(<Statistic title="Status" value="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<Statistic title="T" value={1} className="my-stat" />)
    expect(container.querySelector('.my-stat')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    render(<Statistic title="T" value={1} size={size} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  // --- Precision ---
  it('formats value with precision', () => {
    render(<Statistic title="T" value={123.4} precision={2} />)
    expect(screen.getByText('123.40')).toBeInTheDocument()
  })

  // --- Group separator ---
  it('formats value with group separator enabled', () => {
    render(<Statistic title="T" value={1234567} groupSeparator />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('formats value without separator when disabled', () => {
    render(<Statistic title="T" value={1234567} groupSeparator={false} />)
    expect(screen.getByText('1234567')).toBeInTheDocument()
  })

  // --- Prefix / Suffix ---
  it('renders prefix', () => {
    render(<Statistic title="T" value={100} prefix="$" />)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders suffix', () => {
    render(<Statistic title="T" value={100} suffix="%" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders both prefix and suffix', () => {
    render(<Statistic title="Price" value={99} prefix="$" suffix="USD" />)
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  // --- Animation ---
  it('supports animated numeric values', () => {
    const scheduler = createFrameScheduler()
    vi.stubGlobal('requestAnimationFrame', scheduler.requestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    render(<Statistic title="Animated" value={100} animated animationDuration={100} />)

    expect(scheduler.requestAnimationFrame).toHaveBeenCalled()
    act(() => scheduler.flush(0))
    act(() => scheduler.flush(100))
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('does not animate string values', () => {
    const requestAnimationFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame)

    render(<Statistic title="Status" value="Active" animated />)

    expect(requestAnimationFrame).not.toHaveBeenCalled()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Statistic />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  it('formats zero value with precision', () => {
    render(<Statistic title="T" value={0} precision={2} />)
    expect(screen.getByText('0.00')).toBeInTheDocument()
  })

  it('formats negative number', () => {
    render(<Statistic title="T" value={-42} />)
    expect(screen.getByText('-42')).toBeInTheDocument()
  })

})
