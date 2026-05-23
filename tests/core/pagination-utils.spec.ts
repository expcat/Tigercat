import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createPaginationIdleValidationScheduler,
  formatPageAriaLabel,
  formatPaginationTotal,
  getTimePickerLabels,
  getTimePickerOptionAriaLabel,
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

  it('formats pagination variables with Intl numbers and plural category', () => {
    expect(formatPaginationTotal('Total {total} ({plural})', 1, [1, 1], 'en-US')).toBe(
      'Total 1 (one)'
    )
    expect(formatPageAriaLabel('الصفحة {page}', 12, 'ar-SA')).toBe(
      `الصفحة ${new Intl.NumberFormat('ar-SA').format(12)}`
    )
  })

  it('resolves TimePicker labels for new locale codes', () => {
    expect(getTimePickerLabels('es-ES').selectTime).toBe('Seleccionar hora')
    expect(getTimePickerLabels('ar-SA').ok).toBe('موافق')
    expect(getTimePickerOptionAriaLabel(2, 'hour', 'en-US')).toBe('2 hours')
    expect(getTimePickerOptionAriaLabel(5, 'minute', 'ar-SA')).toBe(
      `${new Intl.NumberFormat('ar-SA').format(5)} دقيقة`
    )
  })
})
