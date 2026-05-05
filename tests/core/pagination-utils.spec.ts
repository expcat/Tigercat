import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createPaginationIdleValidationScheduler,
  getPaginationJumperPage,
  getValidatedPaginationJumperValue,
  resolveTigerLocale
} from '@expcat/tigercat-core'

describe('pagination-utils', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('normalizes quick jumper values within page bounds', () => {
    expect(getPaginationJumperPage('5', 10)).toBe(5)
    expect(getPaginationJumperPage('99', 10)).toBe(10)
    expect(getPaginationJumperPage('0', 10)).toBe(1)
    expect(getPaginationJumperPage('abc', 10)).toBeNull()
    expect(getValidatedPaginationJumperValue('99', 10)).toBe('10')
    expect(getValidatedPaginationJumperValue('abc', 10)).toBe('')
  })

  it('debounces pagination jumper validation before running the latest callback', () => {
    vi.useFakeTimers()
    const scheduler = createPaginationIdleValidationScheduler({ delay: 100 })
    const first = vi.fn()
    const second = vi.fn()

    scheduler.schedule(first)
    scheduler.schedule(second)

    vi.advanceTimersByTime(99)
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('resolves locale loader modules from named exports', async () => {
    const locale = await resolveTigerLocale(() =>
      Promise.resolve({
        zhCN: {
          pagination: {
            jumpToText: '跳至'
          }
        }
      })
    )

    expect(locale?.pagination?.jumpToText).toBe('跳至')
  })
})
