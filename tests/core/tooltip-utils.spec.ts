/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { getTooltipArrowClasses, getTooltipContentClasses } from '@expcat/tigercat-core'

describe('tooltip chrome', () => {
  it('paints the bubble and caret from runtime tokens', () => {
    const bubble = getTooltipContentClasses()
    expect(bubble).toContain('max-w-[280px]')
    expect(bubble).toContain('px-[var(--tiger-spacing-md)]')
    expect(bubble).toContain('py-[var(--tiger-spacing-sm)]')
    expect(bubble).toContain('text-[var(--tiger-surface)]')
    expect(bubble).toContain('bg-[var(--tiger-text)]')
    expect(bubble).toContain('rounded-[var(--tiger-radius-sm)]')
    expect(bubble).toContain('shadow-[var(--tiger-shadow-lg)]')
    expect(bubble).not.toContain('--tiger-component-tooltip-')

    const arrow = getTooltipArrowClasses()
    expect(arrow).toContain('bg-[var(--tiger-text)]')
    expect(arrow).toContain('tiger-tooltip-arrow')
    expect(arrow.split(/\s+/)).not.toContain('border')
    expect(arrow).not.toContain('--tiger-component-tooltip-')
  })
})
