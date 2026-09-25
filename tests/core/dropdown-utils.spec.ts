/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getDropdownItemClasses,
  getDropdownMenuClasses,
  getDropdownSeparatorClasses,
  getPopupMenuItemClasses
} from '@expcat/tigercat-core'

describe('dropdown menu chrome', () => {
  it('uses theme elevation tokens that are actually defined', () => {
    const menu = getDropdownMenuClasses()
    expect(menu).toContain('rounded-[var(--tiger-radius-lg)]')
    expect(menu).toContain('shadow-[var(--tiger-shadow-lg)]')
    expect(menu).toContain('min-w-[180px]')
    expect(menu).not.toContain('--tiger-component-dropdown-')
  })

  it('draws a full-width divider instead of a radius-clipped top border', () => {
    const divided = getDropdownItemClasses(false, true)
    const danger = getPopupMenuItemClasses(false, true, true)
    expect(divided).not.toContain('border-t')
    expect(danger).not.toContain('border-t')
    expect(divided).toContain('before:inset-x-0')
    expect(getDropdownSeparatorClasses()).toContain('h-px')
  })
})
