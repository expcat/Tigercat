/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getListGridColumnClass,
  getListGridGapStyle,
  getListSourceIndex,
  resolveListGridColumnCount,
  resolveListVirtualItemHeight
} from '@expcat/tigercat-core'

describe('list-utils', () => {
  it('resolves a single column count from container width', () => {
    expect(
      resolveListGridColumnCount({ xs: 1, md: 3, '2xl': 4 }, 400, {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      })
    ).toBe(1)
    expect(
      resolveListGridColumnCount({ xs: 1, md: 3 }, 800, {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      })
    ).toBe(3)
  })

  it('treats gutter 0 as 0 and leaves the default gap to class when omitted', () => {
    expect(getListGridGapStyle(0)).toEqual({ gap: '0px' })
    expect(getListGridGapStyle(12)).toEqual({ gap: '12px' })
    expect(getListGridGapStyle(undefined)).toBeUndefined()
  })

  it('maps page-local indices onto the dataSource', () => {
    expect(getListSourceIndex(0, 2, 10, false)).toBe(10)
    expect(getListSourceIndex(0, 2, 10, true)).toBe(0)
  })

  it('defaults virtual item height from size', () => {
    expect(resolveListVirtualItemHeight('md')).toBe(52)
    expect(resolveListVirtualItemHeight('md', 80)).toBe(80)
    expect(getListGridColumnClass(3)).toBe('grid-cols-3')
  })
})
