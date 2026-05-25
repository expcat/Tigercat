/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { render, screen } from '@testing-library/vue'
import { Countdown } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

const baseTime = 1704067200000

afterEach(() => {
  vi.useRealTimers()
})

describe('Countdown', () => {
  it('renders zero by default', () => {
    renderWithProps(Countdown, {})
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00')
  })

  it('renders an initial value from value and now', () => {
    renderWithProps(Countdown, { value: baseTime + 5000, now: baseTime })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:05')
  })

  it('supports Date values', () => {
    renderWithProps(Countdown, { value: new Date(baseTime + 61000), now: new Date(baseTime) })
    expect(screen.getByRole('timer')).toHaveTextContent('00:01:01')
  })

  it('supports ISO string values', () => {
    renderWithProps(Countdown, {
      value: '2024-01-01T00:00:10.000Z',
      now: '2024-01-01T00:00:00.000Z'
    })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:10')
  })

  it('clamps elapsed values to zero', () => {
    renderWithProps(Countdown, { value: baseTime - 1000, now: baseTime })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00')
  })

  it('renders title, prefix, and suffix', () => {
    renderWithProps(Countdown, {
      title: 'Release',
      prefix: 'T-',
      suffix: 'left',
      value: baseTime + 5000,
      now: baseTime
    })

    expect(screen.getByText('Release')).toBeInTheDocument()
    expect(screen.getByText('T-')).toBeInTheDocument()
    expect(screen.getByText('left')).toBeInTheDocument()
  })

  it('applies className and forwards attrs', () => {
    const { container } = renderWithProps(Countdown, {
      className: 'custom-countdown',
      'data-testid': 'countdown'
    })

    expect(container.querySelector('.custom-countdown')).toBeInTheDocument()
    expect(screen.getByTestId('countdown')).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    renderWithProps(Countdown, { title: 'Timer', value: baseTime + 5000, now: baseTime, size })
    expect(screen.getByText('Timer')).toBeInTheDocument()
  })

  it('supports total-hour default formatting', () => {
    renderWithProps(Countdown, { value: baseTime + 90061000, now: baseTime })
    expect(screen.getByRole('timer')).toHaveTextContent('25:01:01')
  })

  it('supports day-aware custom formatting', () => {
    renderWithProps(Countdown, {
      value: baseTime + 90061000,
      now: baseTime,
      format: 'D days HH:mm:ss'
    })
    expect(screen.getByRole('timer')).toHaveTextContent('1 days 01:01:01')
  })

  it('supports compact custom formatting', () => {
    renderWithProps(Countdown, { value: baseTime + 3723000, now: baseTime, format: 'H:m:s' })
    expect(screen.getByRole('timer')).toHaveTextContent('1:2:3')
  })

  it('supports ariaLabel', () => {
    renderWithProps(Countdown, { ariaLabel: 'Campaign countdown' })
    expect(screen.getByRole('timer', { name: 'Campaign countdown' })).toBeInTheDocument()
  })

  it('ticks using Date.now after the initial SSR-safe value', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    renderWithProps(Countdown, { value: baseTime + 3000, now: baseTime, interval: 1000 })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:03')

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(screen.getByRole('timer')).toHaveTextContent('00:00:02')
  })

  it('emits change payloads while ticking', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    const { emitted } = renderWithProps(Countdown, {
      value: baseTime + 3000,
      now: baseTime,
      interval: 1000
    })

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(emitted().change?.[0][0]).toMatchObject({
      remaining: 2000,
      formatted: '00:00:02',
      finished: false
    })
  })

  it('emits finish once when the countdown reaches zero', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    const { emitted } = renderWithProps(Countdown, {
      value: baseTime + 1000,
      now: baseTime,
      interval: 1000
    })

    vi.advanceTimersByTime(1000)
    await nextTick()
    vi.advanceTimersByTime(3000)
    await nextTick()

    expect(emitted().finish).toHaveLength(1)
    expect(emitted().finish?.[0][0]).toMatchObject({ remaining: 0, finished: true })
  })

  it('does not start a timer when interval is disabled', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    const { emitted } = renderWithProps(Countdown, {
      value: baseTime + 3000,
      now: baseTime,
      interval: 0
    })

    vi.advanceTimersByTime(3000)
    await nextTick()

    expect(emitted().change).toBeUndefined()
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:03')
  })

  it('does not start a timer without a target value', async () => {
    vi.useFakeTimers()

    const { emitted } = renderWithProps(Countdown, { interval: 1000 })
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(emitted().change).toBeUndefined()
  })

  it('resets when value changes', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)

    const { rerender } = renderWithProps(Countdown, { value: baseTime + 1000, now: baseTime })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:01')

    await rerender({ value: baseTime + 5000, now: baseTime })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:05')
  })

  it('updates when now changes', async () => {
    const { rerender } = renderWithProps(Countdown, { value: baseTime + 5000, now: baseTime })
    await rerender({ value: baseTime + 5000, now: baseTime + 2000 })
    expect(screen.getByRole('timer')).toHaveTextContent('00:00:03')
  })

  describe('Edge Cases', () => {
    it('handles invalid value without crashing', () => {
      renderWithProps(Countdown, { value: 'invalid-date' })
      expect(screen.getByRole('timer')).toHaveTextContent('00:00:00')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Countdown, {
        props: { value: baseTime + 5000, now: baseTime }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
