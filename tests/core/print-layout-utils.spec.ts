/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  buildPrintLayoutCss,
  getPrintLayoutClasses,
  getPrintLayoutPageKey,
  printLayoutHeaderClasses,
  printLayoutPageBreakClasses,
  resolvePrintPageBox
} from '@expcat/tigercat-core'

describe('print-layout-utils', () => {
  it('resolves named paper into width, height, and @page size', () => {
    const a4 = resolvePrintPageBox('A4', 'portrait')
    expect(a4.width).toBe('210mm')
    expect(a4.height).toBe('297mm')
    expect(a4.pageSize).toContain('A4')
    const letter = resolvePrintPageBox('Letter', 'landscape')
    expect(letter.pageSize).toContain('Letter')
    expect(letter.pageSize).toContain('landscape')
  })

  it('accepts custom width and height', () => {
    const box = resolvePrintPageBox('A4', 'portrait', 100, 150)
    expect(box.width).toBe('100mm')
    expect(box.height).toBe('150mm')
    expect(buildPrintLayoutCss()).toContain('@page')
    expect(buildPrintLayoutCss()).toContain('size: A4 portrait')
    expect(getPrintLayoutPageKey(box).length).toBeGreaterThan(0)
  })

  it('does not hide the page-break box in print', () => {
    expect(printLayoutPageBreakClasses).not.toContain('print:hidden')
    expect(printLayoutHeaderClasses).not.toContain('hidden')
    expect(getPrintLayoutClasses()).toContain('tiger-print-layout')
    expect(getPrintLayoutClasses()).not.toContain('--tiger-print-ink')
  })
})
