/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  buildPrintLayoutCss,
  getPrintLayoutClasses,
  getPrintLayoutPageKey,
  mountPrintInstanceStyle,
  printPrintLayoutRoot,
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

  it('uses A4 for an unknown preset and removes the instance page rule on dispose', () => {
    const box = resolvePrintPageBox('Tabloid', 'portrait')
    expect(box.pageSize).toContain('A4')
    expect(box.width).toBe('210mm')
    const root = document.createElement('div')
    document.body.appendChild(root)
    const detach = mountPrintInstanceStyle(document, 'sheet-test', box)
    const node = document.head.querySelector('[data-tiger-print-page="sheet-test"]')
    expect(node?.textContent).toContain('A4 portrait')
    expect(node?.textContent).not.toContain('body')
    detach()
    expect(document.head.querySelector('[data-tiger-print-page="sheet-test"]')).toBeNull()
    root.remove()
  })

  it('does not hide the page-break box in print', () => {
    expect(printLayoutPageBreakClasses).not.toContain('print:hidden')
    expect(printLayoutHeaderClasses).not.toContain('hidden')
    expect(getPrintLayoutClasses()).toContain('tiger-print-layout')
    expect(getPrintLayoutClasses()).not.toContain('--tiger-print-ink')
  })

  it('printPrintLayoutRoot copies consuming styles and root match state into the frame', () => {
    document.documentElement.className = 'dark'
    const consumer = document.createElement('style')
    consumer.textContent = '.proof { font-size: 31px }'
    document.head.appendChild(consumer)
    const root = document.createElement('div')
    root.className = 'tiger-print-layout'
    root.innerHTML = '<p class="proof">Styled</p>'
    document.body.appendChild(root)

    let captured: { styles: (string | null)[]; htmlClass: string; proof: string | null } | null =
      null
    const originalAppend = Node.prototype.appendChild
    Node.prototype.appendChild = function <T extends Node>(this: Node, node: T): T {
      const result = originalAppend.call(this, node)
      if (node instanceof HTMLIFrameElement && node.hasAttribute('data-tiger-print-frame')) {
        const win = node.contentWindow
        if (win) {
          win.print = () => {
            const frame = node.contentDocument
            captured = frame
              ? {
                  styles: Array.from(frame.querySelectorAll('style')).map((s) => s.textContent),
                  htmlClass: frame.documentElement.className,
                  proof: frame.querySelector('.proof')?.textContent ?? null
                }
              : null
            win.dispatchEvent(new win.Event('afterprint'))
          }
        }
      }
      return result as T
    }
    try {
      printPrintLayoutRoot(root)
      expect(captured).not.toBeNull()
      const shot = captured as unknown as {
        styles: (string | null)[]
        htmlClass: string
        proof: string | null
      }
      expect(shot.styles.some((text) => text?.includes('.proof'))).toBe(true)
      expect(shot.htmlClass).toBe('dark')
      expect(shot.proof).toBe('Styled')
      // afterprint (fired by the stub above) removes the frame
      expect(document.body.querySelector('[data-tiger-print-frame]')).toBeNull()
    } finally {
      Node.prototype.appendChild = originalAppend
      document.documentElement.className = ''
      consumer.remove()
      root.remove()
    }
  })
})
