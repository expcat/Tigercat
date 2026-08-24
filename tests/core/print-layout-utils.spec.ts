/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  printLayoutBaseClasses,
  printLayoutFooterClasses,
  printLayoutHeaderClasses
} from '@expcat/tigercat-core'

describe('print-layout-utils paper ink', () => {
  it('keeps white paper and forces dark ink, not themed --tiger-text', () => {
    expect(printLayoutBaseClasses).toContain('bg-white')
    expect(printLayoutBaseClasses).toContain('#111827')
    expect(printLayoutBaseClasses).toContain('--tiger-print-ink')
    expect(printLayoutBaseClasses).toContain('text-[var(--tiger-print-ink,#111827)]')
    expect(printLayoutBaseClasses).not.toContain('--tiger-text')
    expect(printLayoutBaseClasses).not.toContain('--tiger-surface')
    expect(printLayoutBaseClasses).not.toContain('--tiger-bg')
  })

  it('keeps header and footer print-only', () => {
    expect(printLayoutHeaderClasses).toContain('hidden')
    expect(printLayoutHeaderClasses).toContain('print:block')
    expect(printLayoutFooterClasses).toContain('hidden')
    expect(printLayoutFooterClasses).toContain('print:block')
  })
})
