import { describe, expect, it, vi } from 'vitest'
import {
  createSelectSearchDebouncer,
  resolveSelectFilteredOptions,
  type SelectOptions
} from '@expcat/tigercat-core'

const options: SelectOptions = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' }
]

describe('select-utils', () => {
  it('skips local filtering for remote search', () => {
    expect(resolveSelectFilteredOptions(options, 'Alpha', { searchable: true, remote: true })).toBe(
      options
    )
  })

  it('filters locally for searchable non-remote selects', () => {
    expect(resolveSelectFilteredOptions(options, 'Alpha', { searchable: true })).toEqual([
      { label: 'Alpha', value: 'alpha' }
    ])
  })

  it('debounces search callbacks and keeps only the latest query', () => {
    const onSearch = vi.fn()
    const callbacks = new Map<number, () => void>()
    let nextHandle = 0
    const debouncer = createSelectSearchDebouncer({
      delay: 200,
      onSearch,
      setTimer: (callback) => {
        nextHandle += 1
        callbacks.set(nextHandle, callback)
        return nextHandle
      },
      clearTimer: (handle) => callbacks.delete(handle)
    })

    debouncer.schedule('a')
    debouncer.schedule('ab')

    expect(onSearch).not.toHaveBeenCalled()
    expect(callbacks.size).toBe(1)

    callbacks.get(nextHandle)?.()
    expect(onSearch).toHaveBeenCalledWith('ab')
  })
})
