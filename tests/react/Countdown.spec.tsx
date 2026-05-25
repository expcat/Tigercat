/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Countdown } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const baseTime = 1704067200000

afterEach(() => {
  vi.useRealTimers()
})

describe('Countdown', () => {
  it('renders zero by default', () => {
    render(<Countdown />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00')
  })

  it('renders an initial value from value and now', () => {
    render(<Countdown value={baseTime + 5000} now={baseTime} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:05')
  })

  it('supports Date values', () => {
    render(<Countdown value={new Date(baseTime + 61000)} now={new Date(baseTime)} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:01:01')
  })

  it('supports ISO string values', () => {
    render(<Countdown value="2024-01-01T00:00:10.000Z" now="2024-01-01T00:00:00.000Z" />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:10')
  })

  it('clamps elapsed values to zero', () => {
    render(<Countdown value={baseTime - 1000} now={baseTime} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00')
  })

  it('renders title, prefix, and suffix', () => {
    render(
      <Countdown title="Release" prefix="T-" suffix="left" value={baseTime + 5000} now={baseTime} />
    )
    expect(screen.getByText('Release')).toBeInTheDocument()
    expect(screen.getByText('T-')).toBeInTheDocument()
    expect(screen.getByText('left')).toBeInTheDocument()
  })

  it('applies className and forwards attributes', () => {
    const { container } = render(<Countdown className="custom-countdown" data-testid="countdown" />)
    expect(container.querySelector('.custom-countdown')).toBeInTheDocument()
    expect(screen.getByTestId('countdown')).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    render(<Countdown title="Timer" value={baseTime + 5000} now={baseTime} size={size} />)
    expect(screen.getByText('Timer')).toBeInTheDocument()
  })

  it('supports total-hour default formatting', () => {
    render(<Countdown value={baseTime + 90061000} now={baseTime} />)
    expect(screen.getByRole('timer')).toHaveTextContent('25:01:01')
  })

  it('supports day-aware custom formatting', () => {
    render(<Countdown value={baseTime + 90061000} now={baseTime} format="D days HH:mm:ss" />)
    expect(screen.getByRole('timer')).toHaveTextContent('1 days 01:01:01')
  })

  it('supports compact custom formatting', () => {
    render(<Countdown value={baseTime + 3723000} now={baseTime} format="H:m:s" />)
    expect(screen.getByRole('timer')).toHaveTextContent('1:2:3')
  })

  it('supports ariaLabel', () => {
    render(<Countdown ariaLabel="Campaign countdown" />)
    expect(screen.getByRole('timer', { name: 'Campaign countdown' })).toBeInTheDocument()
  })

  it('ticks using Date.now after the initial SSR-safe value', () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    render(<Countdown value={baseTime + 3000} now={baseTime} interval={1000} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:03')

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:02')
  })

  it('emits change payloads while ticking', () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)
    const onChange = vi.fn()

    render(<Countdown value={baseTime + 3000} now={baseTime} interval={1000} onChange={onChange} />)

    act(() => vi.advanceTimersByTime(1000))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ remaining: 2000, formatted: '00:00:02', finished: false })
    )
  })

  it('emits finish once when the countdown reaches zero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)
    const onFinish = vi.fn()

    render(<Countdown value={baseTime + 1000} now={baseTime} interval={1000} onFinish={onFinish} />)

    act(() => vi.advanceTimersByTime(1000))
    act(() => vi.advanceTimersByTime(3000))

    expect(onFinish).toHaveBeenCalledOnce()
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ remaining: 0, finished: true }))
  })

  it('does not start a timer when interval is disabled', () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)
    const onChange = vi.fn()

    render(<Countdown value={baseTime + 3000} now={baseTime} interval={0} onChange={onChange} />)
    act(() => vi.advanceTimersByTime(3000))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:03')
  })

  it('does not start a timer without a target value', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()

    render(<Countdown interval={1000} onChange={onChange} />)
    act(() => vi.advanceTimersByTime(1000))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('resets when value changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    const { rerender } = render(<Countdown value={baseTime + 1000} now={baseTime} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:01')

    rerender(<Countdown value={baseTime + 5000} now={baseTime} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:05')
  })

  it('updates when now changes', () => {
    const { rerender } = render(<Countdown value={baseTime + 5000} now={baseTime} />)
    rerender(<Countdown value={baseTime + 5000} now={baseTime + 2000} />)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:03')
  })

  describe('Edge Cases', () => {
    it('handles invalid value without crashing', () => {
      render(<Countdown value="invalid-date" />)
      expect(screen.getByRole('timer')).toHaveTextContent('00:00:00')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Countdown value={baseTime + 5000} now={baseTime} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
