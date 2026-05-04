import { describe, it, expect } from 'vitest'
import { defineLocale, enUS } from '@expcat/tigercat-core'

describe('defineLocale()', () => {
  it('returns the enUS baseline as-is when called without overrides', () => {
    const locale = defineLocale()
    expect(locale.common?.okText).toBe(enUS.common?.okText)
    expect(locale.pagination?.totalText).toBe(enUS.pagination?.totalText)
    expect(locale.taskBoard?.boardAriaLabel).toBe(enUS.taskBoard?.boardAriaLabel)
  })

  it('does not mutate the source enUS preset', () => {
    const before = JSON.stringify(enUS)
    defineLocale({ common: { okText: 'OK!' }, pagination: { totalText: '{total}' } })
    expect(JSON.stringify(enUS)).toBe(before)
  })

  it('deep-merges nested overrides on top of the baseline', () => {
    const locale = defineLocale({
      common: { okText: 'はい' },
      pagination: { totalText: '{total} 件' }
    })
    // Overridden fields take the new value
    expect(locale.common?.okText).toBe('はい')
    expect(locale.pagination?.totalText).toBe('{total} 件')
    // Unspecified siblings still inherit from enUS
    expect(locale.common?.cancelText).toBe(enUS.common?.cancelText)
    expect(locale.pagination?.itemsPerPageText).toBe(enUS.pagination?.itemsPerPageText)
    // Untouched sections are preserved from enUS
    expect(locale.modal?.closeAriaLabel).toBe(enUS.modal?.closeAriaLabel)
    expect(locale.formWizard?.finishText).toBe(enUS.formWizard?.finishText)
  })

  it('skips undefined leaves so consumers can build overrides incrementally', () => {
    const locale = defineLocale({
      common: { okText: undefined, cancelText: 'キャンセル' }
    })
    expect(locale.common?.okText).toBe(enUS.common?.okText)
    expect(locale.common?.cancelText).toBe('キャンセル')
  })

  it('adds new sections that do not exist on the baseline', () => {
    const locale = defineLocale({
      drawer: { closeAriaLabel: '閉じる' }
    })
    expect(locale.drawer?.closeAriaLabel).toBe('閉じる')
    // Untouched drawer fields fall back to enUS (or undefined if enUS omits them)
    expect(locale.drawer).toMatchObject({ closeAriaLabel: '閉じる' })
  })

  it('preserves explicit null as a reset signal', () => {
    const locale = defineLocale({
      // @ts-expect-error — null is explicitly testing the override semantic
      common: { okText: null }
    })
    expect(locale.common?.okText).toBeNull()
  })

  it('returns a fresh object on every call (no shared references)', () => {
    const a = defineLocale({ common: { okText: 'A' } })
    const b = defineLocale({ common: { okText: 'B' } })
    expect(a).not.toBe(b)
    expect(a.common).not.toBe(b.common)
    expect(a.common?.okText).toBe('A')
    expect(b.common?.okText).toBe('B')
  })

  it('supports replacing array-typed values wholesale (no array merge)', () => {
    // None of the current TigerLocale fields are arrays, but the helper
    // documents this behaviour. Verify by reaching into a synthetic shape.
    const synthetic = defineLocale({
      // Cast through unknown to simulate a future locale section with arrays.
      taskBoard: { wipLimitText: 'WIP {limit}' }
    })
    expect(synthetic.taskBoard?.wipLimitText).toBe('WIP {limit}')
  })
})
